import React from 'react';

/**
 * Modern Football Pitch Geometry SVG Watermark
 * Adds subtle turf markings, center circle, and penalty arcs for match and hero cards.
 */
export const PitchWatermark: React.FC<{
    className?: string;
    opacity?: number;
    accentColor?: string;
}> = ({ className = "absolute inset-0 pointer-events-none overflow-hidden", opacity = 0.08, accentColor = "#D4AF37" }) => (
    <div className={className} aria-hidden="true">
        <svg
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
            className="w-full h-full"
            style={{ opacity }}
        >
            <defs>
                <linearGradient id="pitchGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                    <stop offset="50%" stopColor={accentColor} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0.3" />
                </linearGradient>
            </defs>
            {/* Outer Pitch Border */}
            <rect x="15" y="15" width="370" height="210" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Halfway Line */}
            <line x1="200" y1="15" x2="200" y2="225" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Center Circle */}
            <circle cx="200" cy="120" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="120" r="3" fill="currentColor" />
            {/* Left Penalty Area */}
            <rect x="15" y="65" width="60" height="110" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 75 95 A 30 30 0 0 1 75 145" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="55" cy="120" r="2" fill="currentColor" />
            {/* Right Penalty Area */}
            <rect x="325" y="65" width="60" height="110" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 325 95 A 30 30 0 0 0 325 145" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="345" cy="120" r="2" fill="currentColor" />
            {/* Corner Arcs */}
            <path d="M 15 25 A 10 10 0 0 0 25 15" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 375 15 A 10 10 0 0 0 385 25" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 15 215 A 10 10 0 0 1 25 225" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 375 225 A 10 10 0 0 1 385 215" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    </div>
);

/**
 * Mobile Gaming / Clash Royale / FC Mobile Style Battle VS Emblem
 */
export const BattleVsEmblem: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const isSm = size === 'sm';
    const isLg = size === 'lg';

    return (
        <div className={`relative flex items-center justify-center select-none ${
            isSm ? 'w-8 h-8' : isLg ? 'w-14 h-14' : 'w-10 h-10 sm:w-12 sm:h-12'
        }`}>
            {/* Subtle Neon Underglow */}
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />

            {/* Hexagonal / Diamond Metallic Badge */}
            <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    <defs>
                        <linearGradient id="vsGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFE082" />
                            <stop offset="50%" stopColor="#FFA000" />
                            <stop offset="100%" stopColor="#795548" />
                        </linearGradient>
                        <linearGradient id="vsInnerBg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1E2330" />
                            <stop offset="100%" stopColor="#0B0D13" />
                        </linearGradient>
                    </defs>
                    {/* Outer Diamond Shield */}
                    <polygon
                        points="30,4 56,30 30,56 4,30"
                        fill="url(#vsInnerBg)"
                        stroke="url(#vsGoldBorder)"
                        strokeWidth="2.5"
                    />
                    {/* Inner Chamfer Rim */}
                    <polygon
                        points="30,9 51,30 30,51 9,30"
                        fill="none"
                        stroke="#FFE082"
                        strokeWidth="0.8"
                        strokeOpacity="0.4"
                    />
                    {/* Energy Horizontal Spark */}
                    <line x1="16" y1="30" x2="44" y2="30" stroke="#FFE082" strokeWidth="1" strokeOpacity="0.3" />
                </svg>

                {/* Sharp VS Text with Bevel Shadow */}
                <span className={`absolute font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                    isSm ? 'text-[10px]' : isLg ? 'text-lg' : 'text-xs sm:text-sm'
                }`}>
                    VS
                </span>
            </div>
        </div>
    );
};

/**
 * Architectural Stadium Silhouette Watermark
 * For Stadium & Revenue Cards
 */
export const StadiumSilhouette: React.FC<{ className?: string; opacity?: number }> = ({
    className = "absolute right-0 bottom-0 pointer-events-none w-48 h-28 overflow-hidden",
    opacity = 0.12
}) => (
    <div className={className} aria-hidden="true" style={{ opacity }}>
        <svg viewBox="0 0 240 140" fill="none" className="w-full h-full text-white">
            {/* Arena Oval Roof Line */}
            <path
                d="M10 110 C 30 40, 210 40, 230 110"
                stroke="currentColor"
                strokeWidth="2"
            />
            {/* Outer Truss Framework */}
            <path
                d="M20 115 C 38 55, 202 55, 220 115"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
            />
            {/* Structural Pylons & Floodlight Masts */}
            <line x1="45" y1="120" x2="60" y2="35" stroke="currentColor" strokeWidth="2" />
            <line x1="195" y1="120" x2="180" y2="35" stroke="currentColor" strokeWidth="2" />
            {/* Floodlight Beams */}
            <circle cx="60" cy="35" r="4" fill="currentColor" />
            <circle cx="180" cy="35" r="4" fill="currentColor" />
            <polygon points="60,35 0,140 100,140" fill="currentColor" opacity="0.08" />
            <polygon points="180,35 140,140 240,140" fill="currentColor" opacity="0.08" />
            {/* Tiered Stands Silhouette */}
            <path
                d="M 50 120 L 70 85 L 170 85 L 190 120 Z"
                fill="currentColor"
                opacity="0.2"
            />
            <line x1="0" y1="130" x2="240" y2="130" stroke="currentColor" strokeWidth="2" />
        </svg>
    </div>
);

/**
 * Tactical Board Blueprint SVG Watermark
 * For Training Week / Tactical Center Cards
 */
export const TacticalBoardWatermark: React.FC<{ className?: string; opacity?: number }> = ({
    className = "absolute inset-0 pointer-events-none overflow-hidden",
    opacity = 0.08
}) => (
    <div className={className} aria-hidden="true" style={{ opacity }}>
        <svg viewBox="0 0 320 200" fill="none" className="w-full h-full text-emerald-400">
            {/* Tactical Grid */}
            <line x1="20" y1="20" x2="300" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="100" x2="300" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="180" x2="300" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            {/* Tactical Runs & Passes (Arrows) */}
            <path d="M 60 140 Q 120 70 160 85" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="160,85 152,80 156,92" fill="currentColor" />
            <path d="M 180 90 Q 240 130 260 60" stroke="currentColor" strokeWidth="2" />
            <polygon points="260,60 252,65 258,72" fill="currentColor" />
            {/* Tactical Nodes (X & O) */}
            <circle cx="60" cy="140" r="7" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="170" cy="85" r="7" stroke="currentColor" strokeWidth="1.8" />
            <text x="215" y="145" fill="currentColor" fontSize="14" fontWeight="bold">✕</text>
            <text x="250" y="60" fill="currentColor" fontSize="14" fontWeight="bold">✕</text>
        </svg>
    </div>
);

/**
 * Player Card Rarity Helper (EA FC Mobile / Clash Royale style)
 */
export interface PlayerRarityVisuals {
    containerClass: string;
    badgeClass: string;
    borderTopGradient: string;
    rarityName: string;
    accentHex: string;
    hasSparkle: boolean;
}

export function getPlayerCardRarity(rating: number, potential?: number): PlayerRarityVisuals {
    const isTopGem = (potential || 0) >= 84;

    if (rating >= 85 || (rating >= 82 && isTopGem)) {
        return {
            containerClass: "bg-gradient-to-b from-[#181126] via-[#0E131F] to-[#0A0D15] border-violet-500/40 hover:border-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
            badgeClass: "bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white border-violet-300 shadow-violet-500/30",
            borderTopGradient: "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400",
            rarityName: "Master / Joya",
            accentHex: "#A855F7",
            hasSparkle: true
        };
    }

    if (rating >= 80) {
        return {
            containerClass: "bg-gradient-to-b from-[#1c160c] via-[#0E131F] to-[#0A0D15] border-amber-500/40 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
            badgeClass: "bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 text-slate-950 border-amber-200 shadow-amber-500/30",
            borderTopGradient: "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500",
            rarityName: "Estrella Oro",
            accentHex: "#F59E0B",
            hasSparkle: true
        };
    }

    if (rating >= 74) {
        return {
            containerClass: "bg-gradient-to-b from-[#0a1816] via-[#0E131F] to-[#0A0D15] border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
            badgeClass: "bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 border-emerald-300 shadow-emerald-500/20",
            borderTopGradient: "bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500",
            rarityName: "Plata Élite",
            accentHex: "#10B981",
            hasSparkle: false
        };
    }

    return {
        containerClass: "bg-gradient-to-b from-[#111624] via-[#0E131F] to-[#0A0D15] border-white/10 hover:border-white/20",
        badgeClass: "bg-white/10 text-white border-white/15",
        borderTopGradient: "bg-gradient-to-r from-slate-600 to-slate-500",
        rarityName: "Estándar",
        accentHex: "#94A3B8",
        hasSparkle: false
    };
}

/**
 * Radar Watermark for Scouting & Transfer Market Cards
 * High-tech concentric sweep radar overlay with compass axes
 */
export const RadarWatermark: React.FC<{
    className?: string;
    opacity?: number;
    accentColor?: string;
}> = ({ className = "absolute right-0 top-0 bottom-0 pointer-events-none w-56 overflow-hidden", opacity = 0.08, accentColor = "#10B981" }) => (
    <div className={className} aria-hidden="true" style={{ opacity }}>
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: accentColor }}>
            <defs>
                <radialGradient id="radarSweep" cx="100" cy="100" r="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                    <stop offset="60%" stopColor={accentColor} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </radialGradient>
            </defs>
            {/* Concentric Range Rings */}
            <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
            <circle cx="100" cy="100" r="12" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="3" fill="currentColor" />

            {/* Crosshair Axes */}
            <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />

            {/* Diagonal Target Grid */}
            <line x1="36" y1="36" x2="164" y2="164" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.3" />
            <line x1="36" y1="164" x2="164" y2="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.3" />

            {/* Sweep Sector / Beam Arc */}
            <path d="M 100 100 L 170 30 A 100 100 0 0 0 100 0 Z" fill="url(#radarSweep)" />

            {/* Blips / Detected targets */}
            <circle cx="130" cy="65" r="3.5" fill={accentColor} />
            <circle cx="130" cy="65" r="7" stroke={accentColor} strokeWidth="1" strokeOpacity="0.4" />
            <circle cx="70" cy="140" r="2.5" fill={accentColor} strokeOpacity="0.8" />
        </svg>
    </div>
);

/**
 * Trophy & Laurel Wreath Watermark for Champions & History Views
 */
export const TrophyLaurelWatermark: React.FC<{
    className?: string;
    opacity?: number;
    accentColor?: string;
}> = ({ className = "absolute right-0 bottom-0 pointer-events-none w-44 h-44 overflow-hidden", opacity = 0.08, accentColor = "#F59E0B" }) => (
    <div className={className} aria-hidden="true" style={{ opacity }}>
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: accentColor }}>
            {/* Laurel Wreath Left */}
            <path
                d="M 45 150 C 25 110, 35 60, 80 35 M 40 135 C 30 115, 35 90, 55 75 M 48 105 C 42 90, 48 75, 65 65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Laurel Wreath Right */}
            <path
                d="M 155 150 C 175 110, 165 60, 120 35 M 160 135 C 170 115, 165 90, 145 75 M 152 105 C 158 90, 152 75, 135 65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Stylized Trophy Silhouette */}
            <path
                d="M 75 60 L 125 60 C 125 90, 115 110, 100 115 C 85 110, 75 90, 75 60 Z"
                fill="currentColor"
                opacity="0.3"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line x1="100" y1="115" x2="100" y2="140" stroke="currentColor" strokeWidth="3" />
            <rect x="80" y="140" width="40" height="10" rx="2" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1.5" />
            {/* Trophy Handles */}
            <path d="M 75 65 C 55 65, 55 95, 77 95" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M 125 65 C 145 65, 145 95, 123 95" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Star on top */}
            <polygon points="100,28 103,36 111,36 105,41 107,49 100,44 93,49 95,41 89,36 97,36" fill="currentColor" />
        </svg>
    </div>
);

/**
 * Clash Royale / FC Mobile Style Podium Rank Badge
 * Used in tables and ranking lists
 */
export const PodiumRankBadge: React.FC<{ rank: number; className?: string }> = ({ rank, className = "" }) => {
    if (rank === 1) {
        return (
            <div className={`relative flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-slate-950 font-black text-[11px] shadow-[0_2px_8px_rgba(245,158,11,0.5)] border border-amber-200 shrink-0 ${className}`}>
                <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">{rank}</span>
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className={`relative flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-900 font-black text-[11px] shadow-[0_2px_6px_rgba(203,213,225,0.4)] border border-white shrink-0 ${className}`}>
                <span>{rank}</span>
            </div>
        );
    }
    if (rank === 3) {
        return (
            <div className={`relative flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 text-amber-100 font-black text-[11px] shadow-[0_2px_6px_rgba(217,119,6,0.3)] border border-amber-500/60 shrink-0 ${className}`}>
                <span>{rank}</span>
            </div>
        );
    }
    return (
        <div className={`flex items-center justify-center w-6 h-6 rounded-md bg-slate-900/80 text-slate-400 font-bold text-[10px] border border-white/5 shrink-0 ${className}`}>
            <span>{rank}</span>
        </div>
    );
};
