/**
 * RESOURCE SYSTEM: Community & Official Pack Catalog
 * 
 * Defines the catalog of official and community packs.
 * Supports filtering, search, sorting, and future cloud synchronization.
 */

import { PackCatalogItem, PackCategory } from './ResourceTypes';

export class PackCatalog {
    /**
     * Built-in verified catalog of packs
     */
    private static catalogItems: PackCatalogItem[] = [
        {
            id: 'official-base-pack',
            name: 'Base Visual Oficial',
            author: {
                id: 'cristian-official',
                name: 'Cristian (Desarrollador)',
                isVerified: true,
                role: 'ADMIN'
            },
            version: '2.0.0',
            category: 'all-in-one',
            description: 'Pack oficial con escudos vectoriales de las 21 ligas, torneos internacionales (Libertadores, Champions League, Sudamericana) y banderas oficiales de países.',
            tags: ['oficial', 'escudos', 'competiciones', 'banderas', 'base'],
            assetCount: 650,
            sizeBytes: 8400000,
            sizeFormatted: '8.4 MB',
            downloads: 14200,
            rating: 4.9,
            isOfficial: true,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/manifests/official-base.json',
            downloadUrl: 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip',
            updatedAt: '2026-10-01T00:00:00Z'
        },
        {
            id: 'argentina-faces-2026',
            name: 'Argentina Faces 2026',
            author: {
                id: 'cristian-official',
                name: 'Cristian (Desarrollador)',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '1.4.0',
            category: 'player-faces',
            description: 'Rostros y fotos auténticas en alta definición para los 30 clubes de Primera División y Primera Nacional de Argentina.',
            tags: ['argentina', 'caras', 'jugadores', 'boca', 'river', 'racing'],
            assetCount: 750,
            sizeBytes: 18500000,
            sizeFormatted: '18.5 MB',
            downloads: 9850,
            rating: 4.8,
            isOfficial: true,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/manifests/argentina-faces.json',
            updatedAt: '2026-09-28T12:00:00Z'
        },
        {
            id: 'premier-league-faces',
            name: 'Premier League Faces HD',
            author: {
                id: 'uk-football-mod',
                name: 'BritishModder',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '1.2.0',
            category: 'player-faces',
            description: 'Fotografías de perfil y rostros oficiales para los 20 planteles de la Premier League inglesa.',
            tags: ['premier-league', 'inglaterra', 'caras', 'arsenal', 'city', 'liverpool'],
            assetCount: 520,
            sizeBytes: 14200000,
            sizeFormatted: '14.2 MB',
            downloads: 7420,
            rating: 4.9,
            isOfficial: false,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/manifests/premier-faces.json',
            updatedAt: '2026-09-25T10:00:00Z'
        },
        {
            id: 'world-clubs-logos-hd',
            name: 'World Clubs Vector Logos HD',
            author: {
                id: 'vector-master',
                name: 'VectorFoot',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '3.1.0',
            category: 'team-logos',
            description: 'Escudos limpios en formato SVG vectorial sin pérdida de calidad para más de 400 clubes de Europa y América.',
            tags: ['escudos', 'vector', 'svg', 'hd', 'mundo'],
            assetCount: 420,
            sizeBytes: 5200000,
            sizeFormatted: '5.2 MB',
            downloads: 11300,
            rating: 4.95,
            isOfficial: false,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/manifests/world-logos.json',
            updatedAt: '2026-09-20T14:30:00Z'
        },
        {
            id: 'international-trophies-3d',
            name: 'Trofeos Oficiales 3D',
            author: {
                id: 'cristian-official',
                name: 'Cristian (Desarrollador)',
                isVerified: true,
                role: 'ADMIN'
            },
            version: '1.1.0',
            category: 'trophies',
            description: 'Trofeos y copas en render 3D: Copa Libertadores, UEFA Champions League, Copa Sudamericana, Intercontinental y copas nacionales.',
            tags: ['trofeos', 'copas', '3d', 'oro', 'libertadores', 'champions'],
            assetCount: 45,
            sizeBytes: 3100000,
            sizeFormatted: '3.1 MB',
            downloads: 6890,
            rating: 4.9,
            isOfficial: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/manifests/trophies.json',
            updatedAt: '2026-09-18T18:00:00Z'
        },
        {
            id: 'fifa-national-flags',
            name: 'Banderas de Selecciones FIFA',
            author: {
                id: 'geo-sports',
                name: 'GeoSports',
                isVerified: false,
                role: 'CREATOR'
            },
            version: '1.0.0',
            category: 'flags',
            description: 'Banderas vectoriales en alta resolución de las 211 asociaciones nacionales de la FIFA.',
            tags: ['banderas', 'paises', 'fifa', 'naciones'],
            assetCount: 211,
            sizeBytes: 1200000,
            sizeFormatted: '1.2 MB',
            downloads: 4120,
            rating: 4.7,
            isOfficial: false,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/manifests/flags.json',
            updatedAt: '2026-09-15T09:00:00Z'
        }
    ];

    /**
     * Get all catalog items with optional filtering and search
     */
    public static getCatalog(options?: {
        category?: PackCategory | 'all';
        query?: string;
        sortBy?: 'featured' | 'downloads' | 'rating' | 'newest';
    }): PackCatalogItem[] {
        let items = [...this.catalogItems];

        // 1. Filter by category
        if (options?.category && options.category !== 'all') {
            items = items.filter(item => item.category === options.category || item.category === 'all-in-one');
        }

        // 2. Search query filter
        if (options?.query && options.query.trim()) {
            const q = options.query.toLowerCase().trim();
            items = items.filter(item => 
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.author.name.toLowerCase().includes(q) ||
                item.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        // 3. Sorting
        const sort = options?.sortBy || 'featured';
        switch (sort) {
            case 'downloads':
                items.sort((a, b) => b.downloads - a.downloads);
                break;
            case 'rating':
                items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                break;
            case 'featured':
            default:
                // Official & Featured first, then downloads
                items.sort((a, b) => {
                    if (a.isOfficial !== b.isOfficial) return a.isOfficial ? -1 : 1;
                    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
                    return b.downloads - a.downloads;
                });
                break;
        }

        return items;
    }

    /**
     * Find a catalog item by ID
     */
    public static getItem(packId: string): PackCatalogItem | undefined {
        return this.catalogItems.find(p => p.id === packId);
    }
}
