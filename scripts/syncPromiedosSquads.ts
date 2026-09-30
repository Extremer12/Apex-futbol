/**
 * Apex AI - Automated Squad & Coach Synchronization from Promiedos
 * Official Source: https://www.promiedos.com.ar
 * 
 * Usage:
 *   npx tsx scripts/syncPromiedosSquads.ts                 # Sync all 30 teams of Liga Argentina
 *   npx tsx scripts/syncPromiedosSquads.ts --team=702     # Sync only River Plate by ID
 *   npx tsx scripts/syncPromiedosSquads.ts --team=racing  # Sync only Racing by slug
 *   npx tsx scripts/syncPromiedosSquads.ts --dry-run      # Preview without writing to disk
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export interface PromiedosTeamConfig {
    id: number;
    name: string;
    zone: 'A' | 'B';
    tier: 'Top' | 'Mid' | 'Lower';
    budget: number;
    transferBudget: number;
    primaryColor: string;
    secondaryColor: string;
    teamMorale: string;
    promiedosUrlName: string;
    promiedosId: string;
    fallbackCoach?: {
        name: string;
        age: number;
    };
}

export const LIGA_ARGENTINA_CONFIG: PromiedosTeamConfig[] = [
    // ==========================================
    // ZONA A (15 Equipos)
    // ==========================================
    {
        id: 701,
        name: 'Boca Juniors',
        zone: 'A',
        tier: 'Top',
        budget: 25000000,
        transferBudget: 10000000,
        primaryColor: '#003DA5',
        secondaryColor: '#FFDB00',
        teamMorale: 'Feliz',
        promiedosUrlName: 'boca-juniors',
        promiedosId: 'igg',
        fallbackCoach: { name: 'Rodolfo Arruabarrena', age: 51 }
    },
    {
        id: 704,
        name: 'Independiente',
        zone: 'A',
        tier: 'Top',
        budget: 14000000,
        transferBudget: 5500000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Contento',
        promiedosUrlName: 'independiente',
        promiedosId: 'ihe',
        fallbackCoach: { name: 'Julio César Vaccari', age: 45 }
    },
    {
        id: 705,
        name: 'San Lorenzo',
        zone: 'A',
        tier: 'Top',
        budget: 12000000,
        transferBudget: 4500000,
        primaryColor: '#002B49',
        secondaryColor: '#C8102E',
        teamMorale: 'Contento',
        promiedosUrlName: 'san-lorenzo',
        promiedosId: 'igf',
        fallbackCoach: { name: 'Rubén Darío Insúa', age: 63 }
    },
    {
        id: 711,
        name: 'Talleres (Córdoba)',
        zone: 'A',
        tier: 'Top',
        budget: 14000000,
        transferBudget: 5000000,
        primaryColor: '#002244',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Feliz',
        promiedosUrlName: 'talleres-cordoba',
        promiedosId: 'jche',
        fallbackCoach: { name: 'Alexander Medina', age: 46 }
    },
    {
        id: 706,
        name: 'Estudiantes de La Plata',
        zone: 'A',
        tier: 'Top',
        budget: 13000000,
        transferBudget: 5000000,
        primaryColor: '#E10600',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Feliz',
        promiedosUrlName: 'estudiantes-de-la-plata',
        promiedosId: 'igh',
        fallbackCoach: { name: 'Eduardo Domínguez', age: 46 }
    },
    {
        id: 707,
        name: 'Vélez Sarsfield',
        zone: 'A',
        tier: 'Top',
        budget: 12000000,
        transferBudget: 4500000,
        primaryColor: '#003DA5',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Feliz',
        promiedosUrlName: 'velez-sarsfield',
        promiedosId: 'ihc',
        fallbackCoach: { name: 'Gustavo Quinteros', age: 59 }
    },
    {
        id: 715,
        name: 'Lanús',
        zone: 'A',
        tier: 'Mid',
        budget: 9000000,
        transferBudget: 3500000,
        primaryColor: '#862633',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Contento',
        promiedosUrlName: 'lanus',
        promiedosId: 'igj',
        fallbackCoach: { name: 'Ricardo Zielinski', age: 65 }
    },
    {
        id: 710,
        name: "Newell's Old Boys",
        zone: 'A',
        tier: 'Mid',
        budget: 9000000,
        transferBudget: 3000000,
        primaryColor: '#000000',
        secondaryColor: '#C8102E',
        teamMorale: 'Normal',
        promiedosUrlName: "newell's-old-boys",
        promiedosId: 'ihh',
        fallbackCoach: { name: 'Frank Kudelka', age: 63 }
    },
    {
        id: 717,
        name: 'Instituto (Córdoba)',
        zone: 'A',
        tier: 'Lower',
        budget: 6000000,
        transferBudget: 2000000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'instituto-ac-cordoba',
        promiedosId: 'hchc',
        fallbackCoach: { name: 'Diego Dabove', age: 51 }
    },
    {
        id: 714,
        name: 'Defensa y Justicia',
        zone: 'A',
        tier: 'Mid',
        budget: 7500000,
        transferBudget: 2500000,
        primaryColor: '#00843D',
        secondaryColor: '#FFD100',
        teamMorale: 'Normal',
        promiedosUrlName: 'defensa-y-justicia',
        promiedosId: 'hcbh',
        fallbackCoach: { name: 'Pablo De Muner', age: 43 }
    },
    {
        id: 722,
        name: 'Platense',
        zone: 'A',
        tier: 'Lower',
        budget: 6000000,
        transferBudget: 2000000,
        primaryColor: '#5C381E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'platense',
        promiedosId: 'hcah',
        fallbackCoach: { name: 'Favio Orsi', age: 50 }
    },
    {
        id: 724,
        name: 'Unión (Santa Fe)',
        zone: 'A',
        tier: 'Lower',
        budget: 6500000,
        transferBudget: 2000000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'union-santa-fe',
        promiedosId: 'hcag',
        fallbackCoach: { name: 'Cristian González', age: 50 }
    },
    {
        id: 719,
        name: 'Central Córdoba (SdE)',
        zone: 'A',
        tier: 'Lower',
        budget: 5500000,
        transferBudget: 1800000,
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'central-cordoba-sde',
        promiedosId: 'beafh',
        fallbackCoach: { name: 'Omar De Felippe', age: 62 }
    },
    {
        id: 727,
        name: 'Deportivo Riestra',
        zone: 'A',
        tier: 'Lower',
        budget: 4500000,
        transferBudget: 1500000,
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Contento',
        promiedosUrlName: 'riestra',
        promiedosId: 'bbjea',
        fallbackCoach: { name: 'Cristian Fabbiani', age: 41 }
    },
    {
        id: 721,
        name: 'Godoy Cruz (Mendoza)',
        zone: 'A',
        tier: 'Mid',
        budget: 7000000,
        transferBudget: 2500000,
        primaryColor: '#003DA5',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'godoy-cruz',
        promiedosId: 'ihd',
        fallbackCoach: { name: 'Daniel Oldrá', age: 57 }
    },

    // ==========================================
    // ZONA B (15 Equipos)
    // ==========================================
    {
        id: 702,
        name: 'River Plate',
        zone: 'B',
        tier: 'Top',
        budget: 30000000,
        transferBudget: 12000000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Feliz',
        promiedosUrlName: 'river-plate',
        promiedosId: 'igi',
        fallbackCoach: { name: 'Marcelo Gallardo', age: 48 }
    },
    {
        id: 703,
        name: 'Racing Club',
        zone: 'B',
        tier: 'Top',
        budget: 18000000,
        transferBudget: 7000000,
        primaryColor: '#6CACE4',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Feliz',
        promiedosUrlName: 'racing-club',
        promiedosId: 'ihg',
        fallbackCoach: { name: 'Gustavo Costas', age: 62 }
    },
    {
        id: 708,
        name: 'Huracán',
        zone: 'B',
        tier: 'Top',
        budget: 9500000,
        transferBudget: 3500000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Feliz',
        promiedosUrlName: 'huracan',
        promiedosId: 'iie',
        fallbackCoach: { name: 'Frank Kudelka', age: 63 }
    },
    {
        id: 709,
        name: 'Rosario Central',
        zone: 'B',
        tier: 'Top',
        budget: 11000000,
        transferBudget: 4000000,
        primaryColor: '#002244',
        secondaryColor: '#FFCD00',
        teamMorale: 'Contento',
        promiedosUrlName: 'rosario-central',
        promiedosId: 'ihf',
        fallbackCoach: { name: 'Ariel Holan', age: 64 }
    },
    {
        id: 726,
        name: 'Argentinos Juniors',
        zone: 'B',
        tier: 'Mid',
        budget: 9000000,
        transferBudget: 3000000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Contento',
        promiedosUrlName: 'argentinos-juniors',
        promiedosId: 'ihb',
        fallbackCoach: { name: 'Cristian Zermatten', age: 50 }
    },
    {
        id: 729,
        name: 'Gimnasia y Esgrima La Plata',
        zone: 'B',
        tier: 'Mid',
        budget: 8000000,
        transferBudget: 2500000,
        primaryColor: '#002B49',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'gimnasia-la-plata',
        promiedosId: 'iia',
        fallbackCoach: { name: 'Marcelo Méndez', age: 43 }
    },
    {
        id: 716,
        name: 'Belgrano (Córdoba)',
        zone: 'B',
        tier: 'Mid',
        budget: 9000000,
        transferBudget: 3000000,
        primaryColor: '#6CACE4',
        secondaryColor: '#000000',
        teamMorale: 'Normal',
        promiedosUrlName: 'belgrano',
        promiedosId: 'fhid',
        fallbackCoach: { name: 'Juan Cruz Real', age: 48 }
    },
    {
        id: 730,
        name: 'Banfield',
        zone: 'B',
        tier: 'Lower',
        budget: 6500000,
        transferBudget: 2000000,
        primaryColor: '#00843D',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'banfield',
        promiedosId: 'ihi',
        fallbackCoach: { name: 'Gustavo Munúa', age: 47 }
    },
    {
        id: 723,
        name: 'Tigre',
        zone: 'B',
        tier: 'Lower',
        budget: 6500000,
        transferBudget: 2000000,
        primaryColor: '#003DA5',
        secondaryColor: '#C8102E',
        teamMorale: 'Normal',
        promiedosUrlName: 'tigre',
        promiedosId: 'iid',
        fallbackCoach: { name: 'Sebastián Domínguez', age: 44 }
    },
    {
        id: 712,
        name: 'Atlético Tucumán',
        zone: 'B',
        tier: 'Lower',
        budget: 6500000,
        transferBudget: 2000000,
        primaryColor: '#6CACE4',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Contento',
        promiedosUrlName: 'atletico-tucuman',
        promiedosId: 'gbfc',
        fallbackCoach: { name: 'Facundo Sava', age: 50 }
    },
    {
        id: 720,
        name: 'Barracas Central',
        zone: 'B',
        tier: 'Lower',
        budget: 5500000,
        transferBudget: 1800000,
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'barracas-central',
        promiedosId: 'jafb',
        fallbackCoach: { name: 'Rubén Darío Insúa', age: 63 }
    },
    {
        id: 718,
        name: 'Sarmiento (Junín)',
        zone: 'B',
        tier: 'Lower',
        budget: 5000000,
        transferBudget: 1500000,
        primaryColor: '#00843D',
        secondaryColor: '#97D700',
        teamMorale: 'Normal',
        promiedosUrlName: 'sarmiento-junin',
        promiedosId: 'hbbh',
        fallbackCoach: { name: 'Javier Sanguinetti', age: 54 }
    },
    {
        id: 731,
        name: 'Independiente Rivadavia (Mendoza)',
        zone: 'B',
        tier: 'Lower',
        budget: 5500000,
        transferBudget: 1800000,
        primaryColor: '#002B49',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        promiedosUrlName: 'independiente-rivadavia',
        promiedosId: 'hcch',
        fallbackCoach: { name: 'Alfredo Berti', age: 52 }
    },
    {
        id: 732,
        name: 'Aldosivi (Mar del Plata)',
        zone: 'B',
        tier: 'Lower',
        budget: 5000000,
        transferBudget: 1500000,
        primaryColor: '#00843D',
        secondaryColor: '#FFD100',
        teamMorale: 'Normal',
        promiedosUrlName: 'aldosivi',
        promiedosId: 'hccd',
        fallbackCoach: { name: 'Andrés Yllana', age: 50 }
    },
    {
        id: 751,
        name: 'San Martín (San Juan)',
        zone: 'B',
        tier: 'Lower',
        budget: 5000000,
        transferBudget: 1500000,
        primaryColor: '#00843D',
        secondaryColor: '#000000',
        teamMorale: 'Normal',
        promiedosUrlName: 'san-martin',
        promiedosId: 'hcai',
        fallbackCoach: { name: 'Raúl Antuña', age: 50 }
    }
];

export interface ScrapedPlayer {
    num: string;
    fullName: string;
    displayName: string;
    position: 'POR' | 'DEF' | 'CEN' | 'DEL';
    formationPosition: string;
    age: number;
    height: number;
    birthdate?: string;
}

export interface ScrapedCoach {
    name: string;
    age: number;
    birthdate?: string;
    nationality: string;
}

export function formatPlayerShortName(fullName: string): string {
    if (!fullName) return '';
    const clean = fullName.trim().replace(/\s+/g, ' ');
    const parts = clean.split(' ');
    if (parts.length === 1) return parts[0];
    if (parts[0].endsWith('.')) return clean;
    const firstName = parts[0];
    const rest = parts.slice(1).join(' ');
    return `${firstName[0].toUpperCase()}. ${rest}`;
}

export function mapPromiedosPosition(formationPosition: string, groupName: string): 'POR' | 'DEF' | 'CEN' | 'DEL' {
    const fp = (formationPosition || '').toLowerCase();
    const gp = (groupName || '').toLowerCase();

    if (fp.includes('arquero') || fp.includes('portero') || gp.includes('arquero')) return 'POR';
    if (fp.includes('defens') || fp.includes('lateral') || fp.includes('central') || gp.includes('defens')) return 'DEF';
    if (fp.includes('mediocampista') || fp.includes('volante') || fp.includes('centrocampista') || fp.includes('medio') || gp.includes('medio')) return 'CEN';
    return 'DEL';
}

export async function fetchPromiedosSquad(team: PromiedosTeamConfig): Promise<{ coach: ScrapedCoach | null; players: ScrapedPlayer[] }> {
    const url = `https://www.promiedos.com.ar/team/${team.promiedosUrlName}/${team.promiedosId}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    if (!res.ok) {
        throw new Error(`Promiedos HTTP ${res.status} for ${team.name} (${url})`);
    }

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) {
        throw new Error(`Could not find __NEXT_DATA__ for ${team.name}`);
    }

    const nextData = JSON.parse(match[1]);
    const squadGroups = nextData.props?.pageProps?.data?.squad?.groups || [];

    let coach: ScrapedCoach | null = null;
    const players: ScrapedPlayer[] = [];

    for (const group of squadGroups) {
        const groupName = group.name || '';
        for (const row of group.rows || []) {
            const obj = row.entity?.object;
            if (!obj) continue;

            const isStaff = obj.is_staff || groupName.toLowerCase().includes('dirección') || groupName.toLowerCase().includes('cuerpo');

            if (isStaff) {
                if (!coach && (obj.formation_position?.toLowerCase().includes('entrenador') || groupName.toLowerCase().includes('dirección') || obj.position?.toLowerCase().includes('dirección'))) {
                    coach = {
                        name: obj.name,
                        age: parseInt(obj.age) || team.fallbackCoach?.age || 50,
                        birthdate: obj.birthdate,
                        nationality: 'Argentina'
                    };
                }
            } else {
                const pos = mapPromiedosPosition(obj.formation_position, groupName);
                players.push({
                    num: obj.num || '',
                    fullName: obj.name,
                    displayName: formatPlayerShortName(obj.name),
                    position: pos,
                    formationPosition: obj.formation_position || '',
                    age: parseInt(obj.age) || 24,
                    height: parseFloat(obj.height) || 1.80,
                    birthdate: obj.birthdate
                });
            }
        }
    }

    if (!coach && team.fallbackCoach) {
        coach = {
            name: team.fallbackCoach.name,
            age: team.fallbackCoach.age,
            nationality: 'Argentina'
        };
    }

    return { coach, players };
}

export function calculatePlayerStats(
    player: ScrapedPlayer,
    team: PromiedosTeamConfig,
    index: number,
    existingPlayer?: { rating?: number; potential?: number; morale?: string; contractYears?: number }
) {
    const age = player.age;

    // Base tier rating
    let baseRating = team.tier === 'Top' ? 76 : team.tier === 'Mid' ? 73 : 70;

    let rating: number;
    let potential: number;

    if (existingPlayer?.rating && existingPlayer.rating >= 60) {
        // Keep tuned / existing rating
        rating = existingPlayer.rating;
        potential = existingPlayer.potential || rating;
    } else {
        // Compute realistic rating
        if (age <= 21) {
            rating = Math.max(65, Math.min(80, baseRating - 2 + (index % 5 === 0 ? 2 : -1)));
            const potBonus = (24 - age) * 2 + (team.tier === 'Top' ? 5 : team.tier === 'Mid' ? 3 : 1);
            potential = Math.min(team.tier === 'Top' ? 86 : team.tier === 'Mid' ? 82 : 78, rating + potBonus);
        } else if (age <= 29) {
            // Prime
            const offset = (index % 3 === 0) ? 3 : (index % 3 === 1) ? 1 : -1;
            rating = Math.max(68, Math.min(team.tier === 'Top' ? 82 : 78, baseRating + offset));
            potential = Math.max(rating, rating + Math.floor(Math.random() * 2));
        } else {
            // Veteran
            const offset = (index % 3 === 0) ? 2 : (index % 3 === 1) ? 0 : -2;
            rating = Math.max(67, Math.min(team.tier === 'Top' ? 81 : 77, baseRating + offset));
            potential = rating;
        }
    }

    // Realistic market value based on rating, potential, and age
    const ageMultiplier = age < 23 ? 1.3 : age < 28 ? 1.05 : age < 32 ? 0.75 : 0.45;
    const rawVal = Math.pow(Math.max(1, rating - 52), 2.7) * 850 * ageMultiplier;
    const value = Math.max(250000, Math.round(rawVal / 50000) * 50000);

    // Realistic weekly wage (USD/week)
    const rawWage = (value * 0.0055) + ((rating - 60) * 450);
    const wage = Math.max(2500, Math.round(rawWage / 500) * 500);

    const contractYears = existingPlayer?.contractYears || (age > 33 ? 1 : age > 30 ? 2 : age < 23 ? 4 : 3);
    const morale = existingPlayer?.morale || (rating >= baseRating ? 'Feliz' : 'Contento');

    return {
        id: team.id * 100 + (index + 1),
        name: player.displayName,
        position: player.position,
        rating,
        potential,
        age,
        value,
        wage,
        morale,
        contractYears
    };
}

export function buildCoachObject(coach: ScrapedCoach | null, team: PromiedosTeamConfig) {
    if (!coach) return null;

    const slug = team.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const coachSlug = coach.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const prestige = team.tier === 'Top' ? 80 : team.tier === 'Mid' ? 72 : 65;
    const salary = team.tier === 'Top' ? 38000 : team.tier === 'Mid' ? 22000 : 14000;
    const signingBonus = team.tier === 'Top' ? 140000 : team.tier === 'Mid' ? 60000 : 30000;

    return {
        id: `coach_${slug}_${coachSlug}`,
        name: coach.name,
        age: coach.age,
        nationality: coach.nationality || 'Argentina',
        style: team.tier === 'Top' ? 'Possession' : team.tier === 'Mid' ? 'Balanced' : 'Counter',
        prestige,
        salary,
        signingBonus,
        preferredFormation: '4-3-3',
        youthDevelopment: 78,
        riskTolerance: 60,
        satisfactionLevel: 85,
        requestedSignings: [],
        tacticalNotes: `${team.name} dirigido por ${coach.name}.`
    };
}

/**
 * Main Sync Runner
 */
export async function syncLigaArgentina(options: { targetTeam?: string; dryRun?: boolean; delayMs?: number } = {}) {
    const { targetTeam, dryRun = false, delayMs = 300 } = options;

    console.log('⚽ [APEX AI] Starting Promiedos Squad & Coach Synchronization...');
    console.log(`📡 Official Source: https://www.promiedos.com.ar`);

    // Read existing team data if available to preserve calibrated ratings
    let existingTeamsMap = new Map<number, any>();
    try {
        const teamsModule = await import('../data/teams/ligaArgentina.ts');
        if (teamsModule.ligaArgentinaTeams) {
            for (const t of teamsModule.ligaArgentinaTeams) {
                existingTeamsMap.set(t.id, t);
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not import existing teams, proceeding with fresh generation.');
    }

    const filteredTeams = targetTeam
        ? LIGA_ARGENTINA_CONFIG.filter(t => 
            t.id.toString() === targetTeam || 
            t.promiedosUrlName.includes(targetTeam.toLowerCase()) ||
            t.name.toLowerCase().includes(targetTeam.toLowerCase())
          )
        : LIGA_ARGENTINA_CONFIG;

    if (filteredTeams.length === 0) {
        console.error(`❌ No teams found matching target: "${targetTeam}"`);
        return;
    }

    console.log(`📋 Teams to sync: ${filteredTeams.length}\n`);

    const updatedTeams: any[] = [];

    for (const teamConfig of LIGA_ARGENTINA_CONFIG) {
        const shouldSync = filteredTeams.some(t => t.id === teamConfig.id);
        const existingTeam = existingTeamsMap.get(teamConfig.id);

        if (!shouldSync && existingTeam) {
            // Keep existing unmodified team
            updatedTeams.push(existingTeam);
            continue;
        }

        console.log(`🔄 Scraping ${teamConfig.name} (${teamConfig.promiedosUrlName})...`);

        try {
            const { coach, players } = await fetchPromiedosSquad(teamConfig);

            // Group players by position order: POR -> DEF -> CEN -> DEL
            const posOrder: Record<string, number> = { 'POR': 1, 'DEF': 2, 'CEN': 3, 'DEL': 4 };
            players.sort((a, b) => (posOrder[a.position] || 99) - (posOrder[b.position] || 99));

            // Map existing players map for matching
            const existingPlayerMap = new Map<string, any>();
            if (existingTeam?.squad) {
                for (const p of existingTeam.squad) {
                    const norm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    existingPlayerMap.set(norm, p);
                    // Also map by last name
                    const parts = p.name.split(' ');
                    const lastName = parts[parts.length - 1]?.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (lastName) existingPlayerMap.set(lastName, p);
                }
            }

            const builtSquad = players.map((p, idx) => {
                const norm = p.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const parts = p.displayName.split(' ');
                const lastName = parts[parts.length - 1]?.toLowerCase().replace(/[^a-z0-9]/g, '');
                const existing = existingPlayerMap.get(norm) || (lastName ? existingPlayerMap.get(lastName) : undefined);
                return calculatePlayerStats(p, teamConfig, idx, existing);
            });

            const coachObj = buildCoachObject(coach, teamConfig);

            const completeTeam = {
                id: teamConfig.id,
                name: teamConfig.name,
                logo: existingTeam?.logo || '',
                leagueId: 'argentina',
                zone: teamConfig.zone,
                budget: teamConfig.budget,
                transferBudget: teamConfig.transferBudget,
                tier: teamConfig.tier,
                teamMorale: teamConfig.teamMorale,
                primaryColor: teamConfig.primaryColor,
                secondaryColor: teamConfig.secondaryColor,
                ...(coachObj ? { coach: coachObj } : {}),
                squad: builtSquad
            };

            updatedTeams.push(completeTeam);
            console.log(`   ✅ ${teamConfig.name}: DT ${coachObj?.name || 'N/A'} | ${builtSquad.length} jugadores`);

            // Polite delay between Promiedos requests
            if (delayMs > 0) {
                await new Promise(r => setTimeout(r, delayMs));
            }
        } catch (err: any) {
            console.error(`   ❌ Error scraping ${teamConfig.name}:`, err.message);
            if (existingTeam) {
                updatedTeams.push(existingTeam);
            }
        }
    }

    if (dryRun) {
        console.log('\n🔍 [DRY-RUN] Finished simulation. No files written.');
        return;
    }

    // Generate formatted TypeScript file
    console.log('\n💾 Writing updated data to data/teams/ligaArgentina.ts...');
    const targetFile = path.resolve(ROOT_DIR, 'data/teams/ligaArgentina.ts');
    let existingContent = '';
    if (fs.existsSync(targetFile)) {
        existingContent = fs.readFileSync(targetFile, 'utf8');
    }

    const tsCode = generateLigaArgentinaTs(updatedTeams, existingContent);
    fs.writeFileSync(targetFile, tsCode, 'utf8');

    // Also update buildCompleteArgentineSquads.cjs to keep project builds synchronized
    const cjsFile = path.resolve(ROOT_DIR, 'scripts/buildCompleteArgentineSquads.cjs');
    if (fs.existsSync(cjsFile)) {
        const cjsCode = generateArgentineCjs(tsCode);
        fs.writeFileSync(cjsFile, cjsCode, 'utf8');
        console.log('💾 Synced scripts/buildCompleteArgentineSquads.cjs');
    }

    console.log('🎉 [SUCCESS] Liga Argentina squad synchronization completed successfully!');
}

function generateLigaArgentinaTs(teams: any[], originalFileContent: string = ''): string {
    const teamsA = teams.filter(t => t.zone === 'A');
    const teamsB = teams.filter(t => t.zone === 'B');

    let output = `import { Team, LeagueId } from '../../types';\nimport { createGenericSquad } from './helpers';\n\n`;
    output += `export const ligaArgentinaTeams: Team[] = [\n`;

    output += `    // ==========================================\n`;
    output += `    // ZONA A (${teamsA.length} Equipos)\n`;
    output += `    // ==========================================\n`;

    for (const team of teamsA) {
        output += formatTeamTs(team);
    }

    output += `    // ==========================================\n`;
    output += `    // ZONA B (${teamsB.length} Equipos)\n`;
    output += `    // ==========================================\n`;

    for (const team of teamsB) {
        output += formatTeamTs(team);
    }

    output += `];\n\n`;

    // Preserve primeraNacionalTeams block
    const pnIndex = originalFileContent.indexOf('export const primeraNacionalTeams');
    if (pnIndex !== -1) {
        output += originalFileContent.slice(pnIndex);
    }

    return output;
}

function formatTeamTs(team: any): string {
    let out = `    {\n`;
    out += `        id: ${team.id},\n`;
    out += `        name: ${JSON.stringify(team.name)},\n`;
    out += `        logo: '',\n`;
    out += `        leagueId: LeagueId.LIGA_ARGENTINA,\n`;
    out += `        zone: '${team.zone}',\n`;
    out += `        budget: ${team.budget},\n`;
    out += `        transferBudget: ${team.transferBudget},\n`;
    out += `        tier: '${team.tier}',\n`;
    out += `        teamMorale: '${team.teamMorale}',\n`;
    out += `        primaryColor: '${team.primaryColor}',\n`;
    out += `        secondaryColor: '${team.secondaryColor}',\n`;

    if (team.coach) {
        out += `        coach: {\n`;
        out += `            id: '${team.coach.id}',\n`;
        out += `            name: ${JSON.stringify(team.coach.name)},\n`;
        out += `            age: ${team.coach.age},\n`;
        out += `            nationality: '${team.coach.nationality}',\n`;
        out += `            style: '${team.coach.style}',\n`;
        out += `            prestige: ${team.coach.prestige},\n`;
        out += `            salary: ${team.coach.salary},\n`;
        out += `            signingBonus: ${team.coach.signingBonus},\n`;
        out += `            preferredFormation: '${team.coach.preferredFormation}',\n`;
        out += `            youthDevelopment: ${team.coach.youthDevelopment},\n`;
        out += `            riskTolerance: ${team.coach.riskTolerance},\n`;
        out += `            satisfactionLevel: ${team.coach.satisfactionLevel},\n`;
        out += `            requestedSignings: [],\n`;
        out += `            tacticalNotes: ${JSON.stringify(team.coach.tacticalNotes)}\n`;
        out += `        },\n`;
    }

    out += `        squad: [\n`;
    for (const p of team.squad) {
        out += `            { id: ${p.id}, name: ${JSON.stringify(p.name)}, position: '${p.position}', rating: ${p.rating}, potential: ${p.potential}, age: ${p.age}, value: ${p.value}, wage: ${p.wage}, morale: '${p.morale}', contractYears: ${p.contractYears} },\n`;
    }
    out += `        ]\n`;
    out += `    },\n`;
    return out;
}

function generateArgentineCjs(tsContent: string): string {
    return `const fs = require('fs');
const path = require('path');

// Definición completa de los 30 clubes de Liga Profesional sincronizados con Promiedos
const ligaArgentinaData = \`${tsContent.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;

const targetPath = path.resolve(__dirname, '../data/teams/ligaArgentina.ts');
fs.writeFileSync(targetPath, ligaArgentinaData, 'utf8');
console.log('✅ Liga Argentina sincronizada exitosamente con Promiedos.');
`;
}

// CLI entry point
const args = process.argv.slice(2);
let targetTeamArg: string | undefined;
let isDryRun = false;

for (const arg of args) {
    if (arg.startsWith('--team=')) {
        targetTeamArg = arg.split('=')[1];
    } else if (arg === '--dry-run') {
        isDryRun = true;
    }
}

syncLigaArgentina({
    targetTeam: targetTeamArg,
    dryRun: isDryRun,
    delayMs: 250
}).catch(err => {
    console.error('Fatal sync error:', err);
    process.exit(1);
});
