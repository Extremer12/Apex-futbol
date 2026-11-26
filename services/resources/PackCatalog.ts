/**
 * RESOURCE SYSTEM: Community Pack Catalog
 *
 * Modular catalog of community visual packs with region, coverage,
 * and rich search indexing (countries, leagues, clubs, and players).
 */

import { PackCatalogItem, PackCategory, PackRegion } from './ResourceTypes';

export class PackCatalog {
    /**
     * Verified modular catalog of community packs.
     * Note: Base game runs 100% cleanly on procedural SVG fallbacks until user opts in.
     */
    private static catalogItems: PackCatalogItem[] = [
        {
            id: 'south-america-logos',
            bundleKey: 'south-america-logos',
            name: 'Escudos de América',
            author: {
                id: 'latam-community',
                name: 'Comunidad LATAM',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '2.1.0',
            category: 'team-logos',
            region: 'AMERICA',
            accentColor: 'cyan',
            description: 'Escudos de clubes de Primera y Ascenso de Argentina, Brasil, Colombia, Chile, México, Paraguay e invitados CONMEBOL.',
            tags: ['escudos', 'america', 'sudamerica', 'conmebol', 'argentina', 'brasil', 'mexico', 'chile', 'colombia', 'paraguay'],
            coverage: ['Argentina', 'Brasil', 'Colombia', 'Chile', 'México', 'Paraguay', 'CONMEBOL'],
            searchTerms: [
                'Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo', 'Estudiantes', 'Vélez', 'Talleres', 'Rosario Central', 'Belgrano',
                'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Botafogo', 'Atlético Mineiro', 'Grêmio', 'Internacional', 'Fluminense', 'Cruzeiro', 'Santos',
                'Club América', 'Chivas', 'Cruz Azul', 'Tigres', 'Monterrey', 'Pumas',
                'Colo-Colo', 'Universidad de Chile', 'Universidad Católica',
                'Atlético Nacional', 'Millonarios', 'América de Cali', 'Junior', 'Santa Fe',
                'Olimpia', 'Cerro Porteño', 'Libertad', 'Guaraní', 'Peñarol', 'Nacional',
                'Liga Argentina', 'Primera Nacional', 'Brasileirão', 'Liga MX', 'Liga BetPlay', 'Copa de Primera'
            ],
            assetCount: 248,
            sizeBytes: 3_400_000,
            sizeFormatted: '3.4 MB',
            downloads: 14200,
            rating: 4.9,
            isOfficial: false,
            isVerified: true,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/',
            downloadUrl: 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip',
            updatedAt: '2026-11-01T00:00:00Z'
        },
        {
            id: 'europe-logos',
            bundleKey: 'europe-logos',
            name: 'Escudos de Europa',
            author: {
                id: 'euro-community',
                name: 'EuroVectors',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '2.1.0',
            category: 'team-logos',
            region: 'EUROPA',
            accentColor: 'indigo',
            description: 'Escudos para las principales ligas de Inglaterra, España, Italia, Alemania y Francia (1ª y 2ª División).',
            tags: ['escudos', 'europa', 'uefa', 'inglaterra', 'espana', 'italia', 'alemania', 'francia'],
            coverage: ['Inglaterra', 'España', 'Italia', 'Alemania', 'Francia'],
            searchTerms: [
                'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club', 'Real Sociedad', 'Sevilla', 'Valencia', 'Villarreal', 'Real Betis', 'Girona',
                'Arsenal', 'Manchester City', 'Manchester United', 'Liverpool', 'Chelsea', 'Tottenham', 'Newcastle', 'Aston Villa', 'West Ham', 'Leeds United',
                'Inter', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina',
                'Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig', 'Eintracht Frankfurt', 'Schalke 04', 'Hamburger SV',
                'PSG', 'Paris Saint-Germain', 'Olympique Marseille', 'Monaco', 'Lyon', 'Lille',
                'Premier League', 'Championship', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'
            ],
            assetCount: 185,
            sizeBytes: 2_800_000,
            sizeFormatted: '2.8 MB',
            downloads: 12900,
            rating: 4.9,
            isOfficial: false,
            isVerified: true,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/',
            downloadUrl: 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip',
            updatedAt: '2026-10-28T00:00:00Z'
        },
        {
            id: 'competitions-logos',
            bundleKey: 'competitions-logos',
            name: 'Ligas y Copas Internacionales',
            author: {
                id: 'tourney-art',
                name: 'TourneyPack',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '1.8.0',
            category: 'league-logos',
            region: 'GLOBAL',
            accentColor: 'amber',
            description: 'Emblemas de competiciones nacionales e internacionales: ligas de 1ª y 2ª división, copas domésticas y torneos continentales.',
            tags: ['ligas', 'copas', 'torneos', 'champions', 'libertadores', 'sudamericana', 'intercontinental'],
            coverage: ['Champions League', 'Libertadores', 'Sudamericana', 'Europa League', 'Ligas Locales'],
            searchTerms: [
                'UEFA Champions League', 'Europa League', 'Copa Libertadores', 'Copa Sudamericana', 'Copa Intercontinental',
                'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Liga Argentina', 'Brasileirão', 'Liga MX',
                'Copa Argentina', 'Copa del Rey', 'FA Cup', 'DFB Pokal', 'Coppa Italia', 'Copa MX'
            ],
            assetCount: 42,
            sizeBytes: 950_000,
            sizeFormatted: '0.9 MB',
            downloads: 11400,
            rating: 4.85,
            isOfficial: false,
            isVerified: true,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/',
            updatedAt: '2026-10-22T00:00:00Z'
        },
        {
            id: 'player-faces-pack',
            bundleKey: 'player-faces-pack',
            name: 'Rostros de Futbolistas HD',
            author: {
                id: 'faces-community',
                name: 'ApexFaces Hub',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '2.4.0',
            category: 'player-faces',
            region: 'GLOBAL',
            accentColor: 'sky',
            description: 'Retratos verificados para planteles de ligas de América y Europa, listos para fichajes, táctica y vistas de partido.',
            tags: ['rostros', 'caras', 'jugadores', 'fotos', 'planteles', 'hd'],
            coverage: ['Europa Top 5', 'Liga Argentina', 'Brasileirão', 'América'],
            searchTerms: [
                'Lionel Messi', 'Kylian Mbappé', 'Erling Haaland', 'Vinícius Júnior', 'Jude Bellingham', 'Bukayo Saka',
                'Lamine Yamal', 'Julián Álvarez', 'Lautaro Martínez', 'Edinson Cavani', 'Miguel Merentiel', 'Franco Mastantuono',
                'Estêvão', 'Endrick', 'Cole Palmer', 'Mohamed Salah', 'Pedri', 'Rodri'
            ],
            assetCount: 2683,
            sizeBytes: 24_600_000,
            sizeFormatted: '24.6 MB',
            downloads: 16500,
            rating: 4.95,
            isOfficial: false,
            isVerified: true,
            isFeatured: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/',
            updatedAt: '2026-11-10T00:00:00Z'
        },
        {
            id: 'trophies-pack',
            bundleKey: 'trophies-pack',
            name: 'Trofeos de Vitrina HD (SVGs)',
            author: {
                id: 'vitrina-studio',
                name: 'Vitrina Studio',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '2.0.0',
            category: 'trophies',
            region: 'GLOBAL',
            accentColor: 'orange',
            description: 'Colección vectorial SVG para tu sala de trofeos: Champions, Libertadores, Recopa Sudamericana, Mundial de Clubes, Ligas y Copas Nacionales.',
            tags: ['trofeos', 'copas', 'vitrina', 'palmares', 'oro', 'svg'],
            coverage: ['Champions League', 'Libertadores', 'Recopa', 'Mundial de Clubes', 'Copas Locales', 'Ligas'],
            searchTerms: [
                'Copa Libertadores', 'Champions League', 'Copa Sudamericana', 'Recopa Sudamericana',
                'Copa Intercontinental', 'Mundial de Clubes', 'Copa Argentina', 'FA Cup',
                'Copa del Rey', 'DFB Pokal', 'Coppa Italia', 'Carabao Cup', 'Copa MX', 'Sala de Trofeos'
            ],
            assetCount: 40,
            sizeBytes: 420_000,
            sizeFormatted: '0.4 MB',
            downloads: 7850,
            rating: 4.8,
            isOfficial: false,
            isVerified: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/',
            updatedAt: '2026-10-15T00:00:00Z'
        },
        {
            id: 'flags-pack',
            bundleKey: 'flags-pack',
            name: 'Banderas Internacionales',
            author: {
                id: 'geo-sports',
                name: 'GeoSports',
                isVerified: true,
                role: 'CREATOR'
            },
            version: '1.0.0',
            category: 'flags',
            region: 'GLOBAL',
            accentColor: 'purple',
            description: 'Banderas vectoriales SVG de federaciones nacionales para torneos, rankings y nacionalidades.',
            tags: ['banderas', 'paises', 'selecciones', 'svg'],
            coverage: ['Argentina', 'España', 'Inglaterra', 'Brasil', 'Italia', 'Alemania', 'Francia', 'México', 'Colombia', 'Chile', 'Paraguay'],
            searchTerms: ['Argentina', 'España', 'Inglaterra', 'Brasil', 'Italia', 'Alemania', 'Francia', 'México', 'Colombia', 'Chile', 'Paraguay', 'Uruguay', 'Portugal'],
            assetCount: 211,
            sizeBytes: 480_000,
            sizeFormatted: '0.5 MB',
            downloads: 5400,
            rating: 4.75,
            isOfficial: false,
            isVerified: true,
            manifestUrl: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/',
            updatedAt: '2026-10-08T00:00:00Z'
        }
    ];

    /**
     * Get all catalog items with optional filtering, region, search, and sorting.
     */
    public static getCatalog(options?: {
        category?: PackCategory | 'all';
        region?: PackRegion | 'ALL';
        query?: string;
        sortBy?: 'featured' | 'downloads' | 'rating' | 'newest' | 'assets' | 'lightest';
    }): PackCatalogItem[] {
        let items = [...this.catalogItems];

        // 1. Filter by category
        if (options?.category && options.category !== 'all') {
            items = items.filter(item => {
                if (options.category === 'league-logos') {
                    return item.category === 'league-logos' || item.category === 'competition-logos' || item.category === 'all-in-one';
                }
                return item.category === options.category || item.category === 'all-in-one';
            });
        }

        // 2. Filter by region
        if (options?.region && options.region !== 'ALL') {
            items = items.filter(item => (item.region || 'GLOBAL') === options.region);
        }

        // 3. Search query filter
        if (options?.query && options.query.trim()) {
            const q = options.query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            items = items.filter(item => this.findMatchReason(item, q) !== null);
        }

        // 4. Sorting
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
            case 'assets':
                items.sort((a, b) => b.assetCount - a.assetCount);
                break;
            case 'lightest':
                items.sort((a, b) => a.sizeBytes - b.sizeBytes);
                break;
            case 'featured':
            default:
                items.sort((a, b) => {
                    if (Boolean(a.isFeatured) !== Boolean(b.isFeatured)) return a.isFeatured ? -1 : 1;
                    return b.downloads - a.downloads;
                });
                break;
        }

        return items;
    }

    /**
     * Find why a pack matches a search query (used to surface "Incluye: ..." badge in UI).
     */
    public static findMatchReason(item: PackCatalogItem, rawQuery: string): string | null {
        const q = rawQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (!q) return null;

        const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (norm(item.name).includes(q) || norm(item.description).includes(q) || norm(item.author.name).includes(q)) {
            return '';
        }

        const matchedCov = item.coverage?.find(c => norm(c).includes(q));
        if (matchedCov) return matchedCov;

        const matchedTerm = item.searchTerms?.find(t => norm(t).includes(q));
        if (matchedTerm) return matchedTerm;

        const matchedTag = item.tags.find(t => norm(t).includes(q));
        if (matchedTag) return matchedTag;

        return null;
    }

    /**
     * Find a catalog item by ID
     */
    public static getItem(packId: string): PackCatalogItem | undefined {
        return this.catalogItems.find(p => p.id === packId);
    }

    /**
     * Compute aggregate catalog totals (used for "Descargar todo" hero banner)
     */
    public static getTotals(): { packCount: number; totalAssets: number; totalBytes: number; totalFormatted: string } {
        const totalAssets = this.catalogItems.reduce((sum, p) => sum + p.assetCount, 0);
        const totalBytes = this.catalogItems.reduce((sum, p) => sum + p.sizeBytes, 0);
        const mb = (totalBytes / (1024 * 1024)).toFixed(1);
        return {
            packCount: this.catalogItems.length,
            totalAssets,
            totalBytes,
            totalFormatted: `${mb} MB`,
        };
    }
}
