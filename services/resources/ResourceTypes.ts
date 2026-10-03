/**
 * RESOURCE SYSTEM: Core Type Definitions
 * 
 * Formal TypeScript definitions for the modular, community-driven
 * Pack & Resource Architecture of Apex Football.
 */

// 1. Supported Resource Types
export type ResourceType = 
    | 'player-face'
    | 'team-logo'
    | 'league-logo'
    | 'competition-logo'
    | 'trophy'
    | 'flag'
    | 'kit'
    | 'stadium'
    | 'manager'
    | 'misc';

// 2. Pack Categories
export type PackCategory = 
    | 'player-faces'
    | 'team-logos'
    | 'league-logos'
    | 'competition-logos'
    | 'trophies'
    | 'flags'
    | 'kits'
    | 'stadiums'
    | 'managers'
    | 'all-in-one'
    | 'misc';

// 3. User & Moderation Roles
export type UserRole = 'USER' | 'CREATOR' | 'MODERATOR' | 'ADMIN';

// 4. Moderation & Verification Status
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'hidden' | 'flagged';

// 5. Pack Author Metadata
export interface PackAuthor {
    id: string;
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
    role?: UserRole;
    contactUrl?: string;
}

// 6. License & Rights Declaration
export interface PackLicense {
    type: 'Community' | 'CreativeCommons' | 'PublicDomain' | 'Custom';
    rightsDeclared: boolean;
    attribution?: string;
    declarationText: string;
}

// 7. Standard Pack Manifest
export interface PackManifest {
    schemaVersion: number; // e.g. 1
    id: string; // e.g. "argentina-faces-2026"
    name: string; // e.g. "Argentina Faces 2026"
    version: string; // semver "1.0.0"
    author: PackAuthor;
    category: PackCategory;
    description: string;
    tags?: string[];
    isOfficial?: boolean;
    
    // Compatibility & Sizing
    gameVersionMin: string;
    gameVersionMax?: string;
    assetCount: number;
    sizeBytes: number;
    checksum?: string;
    
    // Dates & Legal
    createdAt: string;
    updatedAt: string;
    license: PackLicense;
    status: ModerationStatus;

    // Base URL for resolving relative assets (if hosted remotely)
    baseUrl?: string;

    // Asset Mappings (Normalized ID -> Relative Path or CDN Path)
    assets: {
        players?: Record<string, string>; // "101" -> "players/101.webp"
        teams?: Record<string, string>;   // "701" -> "teams/701.svg"
        leagues?: Record<string, string>; // "LIGA_ARGENTINA" -> "leagues/arg.svg"
        competitions?: Record<string, string>; // "champions_league" -> "competitions/ucl.svg"
        trophies?: Record<string, string>; // "copa_libertadores" -> "trophies/lib.webp"
        flags?: Record<string, string>;   // "ARG" -> "flags/ar.svg"
        kits?: Record<string, string>;    // "701_home" -> "kits/701_home.webp"
        stadiums?: Record<string, string>; // "stadium_bombonera" -> "stadiums/bombonera.webp"
        managers?: Record<string, string>; // "mgr_riquelme" -> "managers/riquelme.webp"
        misc?: Record<string, string>;
    };
}

// 8. Installed Pack State stored locally on client
export interface InstalledPack {
    packId: string;
    name: string;
    version: string;
    category: PackCategory;
    enabled: boolean;
    priority: number; // Higher number = higher precedence (default 10)
    installedAt: number;
    lastUpdated: number;
    checksum?: string;
    assetCount: number;
    sizeBytes: number;
    isOfficial?: boolean;
    manifest: PackManifest;
}

// 9. Community Catalog Item (for browsing & downloading)
export interface PackCatalogItem {
    id: string;
    name: string;
    author: PackAuthor;
    version: string;
    category: PackCategory;
    description: string;
    tags: string[];
    assetCount: number;
    sizeBytes: number;
    sizeFormatted: string; // e.g. "14.2 MB"
    downloads: number;
    rating?: number;
    isOfficial: boolean;
    isFeatured?: boolean;
    manifestUrl: string;
    downloadUrl?: string; // ZIP download URL
    previewImages?: string[];
    updatedAt: string;
}

// 10. Resource Resolution Result
export interface ResourceResolution {
    url: string;
    source: 'installed-pack' | 'builtin-cdn' | 'fallback';
    packId?: string;
    isFallback: boolean;
}

// 11. User Community Contribution Item
export interface UserContribution {
    id: string;
    userId: string;
    userName: string;
    resourceType: ResourceType;
    targetId: string | number; // e.g. 101
    targetLabel: string; // e.g. "Bukayo Saka"
    fileBlob?: Blob;
    fileUrl?: string;
    mimeType: string;
    sizeBytes: number;
    status: ModerationStatus;
    submittedAt: string;
    reviewedAt?: string;
    moderatorNotes?: string;
}
