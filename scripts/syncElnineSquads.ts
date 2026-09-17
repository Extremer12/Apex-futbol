/**
 * Script de mapeo y sincronización de plantillas de Elnine (elnine.com.ar)
 * Permite mapear y actualizar las plantillas de los clubes de la Liga Profesional y Primera Nacional.
 */

export interface ElnineTeamMapping {
    teamId: number;
    teamName: string;
    slug: string;
    elnineUrl: string;
}

export const ELNINE_ARGENTINA_TEAMS: ElnineTeamMapping[] = [
    { teamId: 701, teamName: 'Boca Juniors', slug: 'boca-juniors-pHrfj0cwD8', elnineUrl: 'https://elnine.com.ar/equipo/boca-juniors-pHrfj0cwD8' },
    { teamId: 702, teamName: 'River Plate', slug: 'river-plate', elnineUrl: 'https://elnine.com.ar/equipo/river-plate' },
    { teamId: 703, teamName: 'Racing Club', slug: 'racing-club', elnineUrl: 'https://elnine.com.ar/equipo/racing-club' },
    { teamId: 704, teamName: 'Independiente', slug: 'independiente', elnineUrl: 'https://elnine.com.ar/equipo/independiente' },
    { teamId: 705, teamName: 'San Lorenzo', slug: 'san-lorenzo', elnineUrl: 'https://elnine.com.ar/equipo/san-lorenzo' },
    { teamId: 706, teamName: 'Vélez Sarsfield', slug: 'velez-sarsfield', elnineUrl: 'https://elnine.com.ar/equipo/velez-sarsfield' },
    { teamId: 707, teamName: 'Estudiantes LP', slug: 'estudiantes-lp', elnineUrl: 'https://elnine.com.ar/equipo/estudiantes-lp' },
    { teamId: 708, teamName: 'Gimnasia LP', slug: 'gimnasia-lp', elnineUrl: 'https://elnine.com.ar/equipo/gimnasia-lp' },
    { teamId: 709, teamName: 'Rosario Central', slug: 'rosario-central', elnineUrl: 'https://elnine.com.ar/equipo/rosario-central' },
    { teamId: 710, teamName: 'Newell\'s Old Boys', slug: 'newells-old-boys', elnineUrl: 'https://elnine.com.ar/equipo/newells-old-boys' },
    { teamId: 711, teamName: 'Talleres', slug: 'talleres-cordoba', elnineUrl: 'https://elnine.com.ar/equipo/talleres-cordoba' },
    { teamId: 712, teamName: 'Belgrano', slug: 'belgrano-cordoba', elnineUrl: 'https://elnine.com.ar/equipo/belgrano-cordoba' },
    { teamId: 713, teamName: 'Huracán', slug: 'huracan', elnineUrl: 'https://elnine.com.ar/equipo/huracan' },
    { teamId: 714, teamName: 'Argentinos Juniors', slug: 'argentinos-juniors', elnineUrl: 'https://elnine.com.ar/equipo/argentinos-juniors' },
    { teamId: 715, teamName: 'Lanús', slug: 'lanus', elnineUrl: 'https://elnine.com.ar/equipo/lanus' },
    { teamId: 716, teamName: 'Banfield', slug: 'banfield', elnineUrl: 'https://elnine.com.ar/equipo/banfield' },
    { teamId: 717, teamName: 'Defensa y Justicia', slug: 'defensa-y-justicia', elnineUrl: 'https://elnine.com.ar/equipo/defensa-y-justicia' },
    { teamId: 718, teamName: 'Godoy Cruz', slug: 'godoy-cruz', elnineUrl: 'https://elnine.com.ar/equipo/godoy-cruz' },
    { teamId: 719, teamName: 'Unión', slug: 'union-santa-fe', elnineUrl: 'https://elnine.com.ar/equipo/union-santa-fe' },
    { teamId: 720, teamName: 'Atlético Tucumán', slug: 'atletico-tucuman', elnineUrl: 'https://elnine.com.ar/equipo/atletico-tucuman' },
    { teamId: 721, teamName: 'Platense', slug: 'platense', elnineUrl: 'https://elnine.com.ar/equipo/platense' },
    { teamId: 722, teamName: 'Tigre', slug: 'tigre', elnineUrl: 'https://elnine.com.ar/equipo/tigre' },
    { teamId: 723, teamName: 'Central Córdoba', slug: 'central-cordoba-se', elnineUrl: 'https://elnine.com.ar/equipo/central-cordoba-se' },
    { teamId: 724, teamName: 'Instituto', slug: 'instituto-cordoba', elnineUrl: 'https://elnine.com.ar/equipo/instituto-cordoba' },
    { teamId: 725, teamName: 'Barracas Central', slug: 'barracas-central', elnineUrl: 'https://elnine.com.ar/equipo/barracas-central' },
    { teamId: 726, teamName: 'Deportivo Riestra', slug: 'deportivo-riestra', elnineUrl: 'https://elnine.com.ar/equipo/deportivo-riestra' },
    { teamId: 727, teamName: 'Independiente Rivadavia', slug: 'independiente-rivadavia', elnineUrl: 'https://elnine.com.ar/equipo/independiente-rivadavia' },
    { teamId: 728, teamName: 'Sarmiento', slug: 'sarmiento-junin', elnineUrl: 'https://elnine.com.ar/equipo/sarmiento-junin' },
    { teamId: 729, teamName: 'San Martín de San Juan', slug: 'san-martin-sj', elnineUrl: 'https://elnine.com.ar/equipo/san-martin-sj' },
    { teamId: 730, teamName: 'Aldosivi', slug: 'aldosivi', elnineUrl: 'https://elnine.com.ar/equipo/aldosivi' }
];

export function mapElninePositionToGame(pos: string): 'POR' | 'DEF' | 'CEN' | 'DEL' {
    const p = pos.toLowerCase();
    if (p.includes('arquero') || p.includes('portero') || p === 'por' || p === 'gk') return 'POR';
    if (p.includes('defensor') || p.includes('defensa') || p.includes('lateral') || p.includes('central') || p === 'def') return 'DEF';
    if (p.includes('mediocampista') || p.includes('medio') || p.includes('volante') || p.includes('cen') || p === 'mid') return 'CEN';
    return 'DEL';
}
