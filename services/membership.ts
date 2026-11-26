import { ClubMembership, LeagueId, MembershipPolicy, Stadium, Team } from '../types';
import { getTeamStadium } from '../data/stadiums';

/**
 * Real-world active paying members & season ticket base by club ID and normalized name.
 * Reflects authentic club membership cultures (Socios in ARG/ESP/BRA/URU/CHI/PAR,
 * Mitglieder/Dauerkarten in GER, Paid Members + Season Tickets in ENG/ITA/FRA/MEX).
 */
const REAL_MEMBERS_BY_ID: Record<number, number> = {
    // Argentina - Liga Profesional & Primera Nacional
    701: 323_000, // Boca Juniors
    702: 351_000, // River Plate
    703: 96_000,  // Racing Club
    704: 146_000, // Independiente
    705: 88_000,  // San Lorenzo
    706: 58_000,  // Estudiantes LP
    707: 64_000,  // Vélez Sarsfield
    708: 51_000,  // Huracán
    709: 95_000,  // Rosario Central
    710: 83_000,  // Newell's Old Boys
    711: 74_000,  // Talleres
    712: 31_000,  // Atlético Tucumán
    713: 65_000,  // Belgrano
    714: 15_000,  // Defensa y Justicia
    715: 42_000,  // Lanús
    716: 24_000,  // Argentinos Juniors
    717: 28_000,  // Banfield
    718: 38_000,  // Gimnasia LP
    719: 34_000,  // Unión
    720: 33_000,  // Instituto
    722: 18_000,  // Central Córdoba
    724: 26_000,  // Godoy Cruz
    725: 20_000,  // Platense
    726: 22_000,  // Tigre
    732: 18_000,  // Quilmes
    733: 16_000,  // Ferro

    // Brasil - Brasileirão
    801: 165_000, // Flamengo
    802: 192_000, // Palmeiras
    803: 74_000,  // São Paulo FC
    804: 140_000, // Corinthians
    805: 46_000,  // Santos
    806: 115_000, // Grêmio
    807: 138_000, // Internacional
    808: 95_000,  // Atlético Mineiro
    809: 58_000,  // Fluminense
    810: 72_000,  // Botafogo
    811: 62_000,  // Vasco da Gama
    812: 78_000,  // Cruzeiro
    813: 42_000,  // Athletico Paranaense
    814: 48_000,  // Fortaleza
    815: 76_000,  // Bahia

    // Premier League
    1: 185_000,   // Arsenal
    2: 72_000,    // Aston Villa
    3: 130_000,   // Chelsea
    4: 195_000,   // Liverpool
    5: 135_000,   // Manchester City
    6: 210_000,   // Manchester Utd
    7: 95_000,    // Newcastle Utd
    8: 155_000,   // Tottenham
    9: 85_000,    // West Ham

    // La Liga
    201: 118_000, // Real Madrid
    202: 143_000, // FC Barcelona
    203: 142_000, // Atlético Madrid
    204: 44_000,  // Athletic Club
    205: 38_000,  // Real Sociedad
    206: 72_000,  // Real Betis
    209: 42_000,  // Valencia CF
    210: 45_000,  // Sevilla FC

    // Bundesliga
    401: 382_000, // Bayern München
    402: 218_000, // Borussia Dortmund
    403: 55_000,  // Bayer Leverkusen
    405: 148_000, // Eintracht Frankfurt
    406: 115_000, // VfB Stuttgart
    410: 102_000, // Bor. Mönchengladbach
    411: 58_000,  // Werder Bremen
    415: 68_000,  // Union Berlin

    // Serie A
    501: 115_000, // Inter Milano
    502: 110_000, // AC Milan
    503: 105_000, // Juventus
    504: 92_000,  // AS Roma
    505: 85_000,  // Napoli

    // Ligue 1
    601: 90_000,  // PSG
    602: 95_000,  // Olympique de Marseille
    606: 55_000,  // RC Lens
    607: 65_000,  // Olympique Lyonnais

    // México, Chile, Paraguay, Uruguay
    1101: 65_000, // América
    1102: 62_000, // Chivas
    1103: 45_000, // Cruz Azul
    1104: 54_000, // Monterrey
    1105: 52_000, // Tigres
    1201: 92_000, // Colo-Colo
    1202: 68_000, // U. de Chile
    1203: 32_000, // U. Católica
    981: 58_000,  // Olimpia
    982: 52_000,  // Cerro Porteño
    9121: 95_000, // Peñarol
    9122: 85_000, // Nacional
    9113: 45_000, // LDU Quito
    9115: 70_000, // Barcelona SC
    2001: 390_000, // Benfica
    2002: 160_000, // Sporting CP
    2003: 145_000, // FC Porto
    2101: 65_000,  // PSV Eindhoven
    2102: 82_000,  // Feyenoord
    2103: 110_000, // Ajax
    2401: 55_000,  // Inter Miami CF
    2407: 45_000,  // Atlanta United
};

const REAL_MEMBERS_BY_NAME: Record<string, number> = {
    'boca juniors': 323_000,
    'river plate': 351_000,
    'independiente': 146_000,
    'racing club': 96_000,
    'rosario central': 95_000,
    'san lorenzo': 88_000,
    'newell\'s old boys': 83_000,
    'newell’s old boys': 83_000,
    'talleres': 74_000,
    'belgrano': 65_000,
    'vélez sarsfield': 64_000,
    'estudiantes lp': 58_000,
    'huracán': 51_000,
    'colón (santa fe)': 32_000,
    'san martín (t)': 24_000,
    'palmeiras': 192_000,
    'flamengo': 165_000,
    'corinthians': 140_000,
    'internacional': 138_000,
    'grêmio': 115_000,
    'atlético mineiro': 95_000,
    'bayern münchen': 382_000,
    'borussia dortmund': 218_000,
    'eintracht frankfurt': 148_000,
    'fc barcelona': 143_000,
    'real madrid': 118_000,
    'atlético madrid': 142_000,
    'manchester utd': 210_000,
    'liverpool': 195_000,
    'arsenal': 185_000,
    'tottenham': 155_000,
    'colo-colo': 92_000,
    'universidad de chile': 68_000,
    'atlético nacional': 55_000,
    'millonarios': 52_000,
};

export interface MembershipPolicyMeta {
    id: MembershipPolicy;
    label: string;
    shortDesc: string;
    feeMultiplier: number;
    growthMultiplier: number;
    churnMultiplier: number;
    fanApprovalImpact: number;
}

export const MEMBERSHIP_POLICY_META: Record<MembershipPolicy, MembershipPolicyMeta> = {
    popular: {
        id: 'popular',
        label: 'Cuota Popular',
        shortDesc: '-20% valor · +50% captación · +4 aprobación',
        feeMultiplier: 0.80,
        growthMultiplier: 1.50,
        churnMultiplier: 0.60,
        fanApprovalImpact: 4,
    },
    standard: {
        id: 'standard',
        label: 'Cuota Estándar',
        shortDesc: 'Equilibrio institucional y fidelización orgánica',
        feeMultiplier: 1.00,
        growthMultiplier: 1.00,
        churnMultiplier: 1.00,
        fanApprovalImpact: 0,
    },
    exclusive: {
        id: 'exclusive',
        label: 'Cuota Prémium',
        shortDesc: '+30% valor · -5 aprobación · riesgo de bajas si pierdes',
        feeMultiplier: 1.30,
        growthMultiplier: 0.65,
        churnMultiplier: 1.65,
        fanApprovalImpact: -5,
    },
};

/**
 * Blended average weekly fee per active paying member (in EUR).
 * Combines standard socios/members, youth/adherentes and season-ticket holders.
 */
export const getBaseWeeklyFeePerMember = (leagueId: string, tier: Team['tier']): number => {
    switch (leagueId) {
        case LeagueId.PREMIER_LEAGUE:
            return tier === 'Top' ? 3.85 : tier === 'Mid' ? 3.15 : 2.50;
        case LeagueId.CHAMPIONSHIP:
            return tier === 'Top' ? 2.15 : tier === 'Mid' ? 1.85 : 1.55;
        case LeagueId.LA_LIGA:
            return tier === 'Top' ? 4.05 : tier === 'Mid' ? 3.05 : 2.25;
        case LeagueId.SEGUNDA_DIVISION_ESP:
            return tier === 'Top' ? 1.90 : tier === 'Mid' ? 1.65 : 1.35;
        case LeagueId.BUNDESLIGA:
            return tier === 'Top' ? 2.35 : tier === 'Mid' ? 2.05 : 1.75;
        case LeagueId.ZWEITE_BUNDESLIGA:
            return tier === 'Top' ? 1.70 : tier === 'Mid' ? 1.50 : 1.30;
        case LeagueId.SERIE_A:
            return tier === 'Top' ? 3.35 : tier === 'Mid' ? 2.60 : 1.95;
        case LeagueId.SERIE_B_ITA:
            return tier === 'Top' ? 1.65 : tier === 'Mid' ? 1.45 : 1.25;
        case LeagueId.LIGUE_1:
            return tier === 'Top' ? 3.05 : tier === 'Mid' ? 2.35 : 1.75;
        case LeagueId.LIGUE_2:
            return tier === 'Top' ? 1.55 : tier === 'Mid' ? 1.35 : 1.15;
        case LeagueId.BRASILEIRAO:
            return tier === 'Top' ? 2.20 : tier === 'Mid' ? 1.85 : 1.50;
        case LeagueId.SERIE_B_BR:
            return tier === 'Top' ? 1.45 : tier === 'Mid' ? 1.25 : 1.05;
        case LeagueId.LIGA_MX:
            return tier === 'Top' ? 3.15 : tier === 'Mid' ? 2.45 : 1.85;
        case LeagueId.LIGA_EXPANSION_MX:
            return 1.30;
        case LeagueId.LIGA_ARGENTINA:
            return tier === 'Top' ? 1.85 : tier === 'Mid' ? 1.55 : 1.30;
        case LeagueId.PRIMERA_NACIONAL:
            return tier === 'Top' ? 1.35 : tier === 'Mid' ? 1.20 : 1.00;
        case LeagueId.PRIMERA_DIVISION_CHILE:
        case LeagueId.PRIMERA_A_COLOMBIA:
        case LeagueId.COPA_DE_PRIMERA:
        case LeagueId.LIGA_URUGUAYA:
        case LeagueId.LIGA_ECUADOR:
            return tier === 'Top' ? 1.75 : tier === 'Mid' ? 1.45 : 1.20;
        case LeagueId.PRIMEIRA_LIGA:
        case LeagueId.EREDIVISIE:
            return tier === 'Top' ? 2.40 : tier === 'Mid' ? 1.90 : 1.45;
        case LeagueId.MLS:
            return tier === 'Top' ? 3.25 : tier === 'Mid' ? 2.50 : 1.95;
        case LeagueId.PRIMERA_B_CHILE:
        case LeagueId.PRIMERA_B_COLOMBIA:
            return 1.05;
        default:
            return 1.80;
    }
};

const getCultureMembershipMultiplier = (leagueId: string): number => {
    switch (leagueId) {
        case LeagueId.LIGA_ARGENTINA:
        case LeagueId.PRIMERA_NACIONAL:
        case LeagueId.BUNDESLIGA:
        case LeagueId.ZWEITE_BUNDESLIGA:
            return 1.55;
        case LeagueId.BRASILEIRAO:
        case LeagueId.SERIE_B_BR:
        case LeagueId.PREMIER_LEAGUE:
        case LeagueId.LA_LIGA:
            return 1.35;
        case LeagueId.CHAMPIONSHIP:
        case LeagueId.SERIE_A:
        case LeagueId.LIGUE_1:
        case LeagueId.PRIMERA_DIVISION_CHILE:
        case LeagueId.COPA_DE_PRIMERA:
            return 1.15;
        default:
            return 0.95;
    }
};

export const generateClubMembership = (team: Team, stadium?: Stadium): ClubMembership => {
    const stadiumInfo = stadium || getTeamStadium(team);
    const capacity = stadiumInfo.capacity || 25_000;

    let baseMembers = REAL_MEMBERS_BY_ID[team.id];
    if (!baseMembers && team.name) {
        baseMembers = REAL_MEMBERS_BY_NAME[team.name.toLowerCase().trim()];
    }

    if (!baseMembers) {
        const tierFactor = team.tier === 'Top' ? 1.45 : team.tier === 'Mid' ? 0.92 : 0.58;
        const cultureFactor = getCultureMembershipMultiplier(team.leagueId as string);
        const isSecondDiv = [
            LeagueId.CHAMPIONSHIP, LeagueId.SEGUNDA_DIVISION_ESP, LeagueId.ZWEITE_BUNDESLIGA,
            LeagueId.SERIE_B_ITA, LeagueId.LIGUE_2, LeagueId.PRIMERA_NACIONAL,
            LeagueId.SERIE_B_BR, LeagueId.LIGA_EXPANSION_MX, LeagueId.PRIMERA_B_CHILE, LeagueId.PRIMERA_B_COLOMBIA
        ].includes(team.leagueId as LeagueId);
        const divFactor = isSecondDiv ? 0.50 : 1.0;
        baseMembers = Math.max(3_500, Math.round((capacity * tierFactor * cultureFactor * divFactor) / 100) * 100);
    }

    const weeklyFeePerMember = getBaseWeeklyFeePerMember(team.leagueId as string, team.tier);

    return {
        activeMembers: baseMembers,
        baseMembers,
        weeklyFeePerMember,
        lastWeeklyDelta: 0,
        lastDeltaReason: 'Padrón inicial de temporada',
        totalPeakMembers: baseMembers,
    };
};

export const calculateMembershipRevenue = (
    membership?: ClubMembership,
    policy: MembershipPolicy = 'standard'
): number => {
    if (!membership || membership.activeMembers <= 0) return 0;
    const mult = MEMBERSHIP_POLICY_META[policy]?.feeMultiplier ?? 1.0;
    return Math.floor(membership.activeMembers * membership.weeklyFeePerMember * mult);
};

export interface WeeklyMembershipUpdateInput {
    membership: ClubMembership;
    fanApprovalRating: number;
    leaguePosition: number;
    totalTeamsInLeague: number;
    policy?: MembershipPolicy;
    stadiumCapacity: number;
    facilityLevel?: number;
    matchOutcome?: 'win' | 'draw' | 'loss' | null;
    wasDerby?: boolean;
    beatTopRival?: boolean;
}

export const processWeeklyMembershipUpdate = (
    input: WeeklyMembershipUpdateInput
): { updatedMembership: ClubMembership; delta: number; reason: string } => {
    const {
        membership,
        fanApprovalRating,
        leaguePosition,
        totalTeamsInLeague,
        policy = 'standard',
        stadiumCapacity,
        facilityLevel = 1,
        matchOutcome = null,
        wasDerby = false,
        beatTopRival = false,
    } = input;

    const policyMeta = MEMBERSHIP_POLICY_META[policy] || MEMBERSHIP_POLICY_META.standard;
    const current = Math.max(500, membership.activeMembers);
    const base = Math.max(1_000, membership.baseMembers);

    // 1. Base weekly rate driven by fanApproval (0-100)
    let rate = 0;
    let reason = 'Estabilidad del padrón societario';

    if (fanApprovalRating >= 82) {
        rate = 0.0045; // +0.45%/wk euphoria
        reason = 'Fiebre societaria por el gran momento del club';
    } else if (fanApprovalRating >= 70) {
        rate = 0.0025;
        reason = 'Alta aprobación impulsa nuevas afiliaciones';
    } else if (fanApprovalRating >= 56) {
        rate = 0.0010;
        reason = 'Crecimiento orgánico de socios activos';
    } else if (fanApprovalRating >= 45) {
        rate = -0.0005;
        reason = 'Cierta cautela y estancamiento en altas';
    } else if (fanApprovalRating >= 32) {
        rate = -0.0038;
        reason = 'Descontento social genera morosidad y bajas';
    } else {
        rate = -0.0085;
        reason = 'Crisis institucional: renuncia masiva de socios';
    }

    // 2. Standings context
    if (leaguePosition <= 3) {
        rate += 0.0012;
    } else if (totalTeamsInLeague > 12 && leaguePosition >= totalTeamsInLeague - 3) {
        rate -= 0.0018;
        if (rate < 0) reason = 'Temor al descenso golpea el padrón';
    }

    // 3. Match result momentum
    if (matchOutcome === 'win') {
        rate += 0.0010;
        if (wasDerby) {
            rate += 0.0022;
            reason = 'Euforia tras ganar el clásico dispara altas';
        } else if (beatTopRival) {
            rate += 0.0012;
            reason = 'Triunfo ante rival directo entusiasma a la hinchada';
        }
    } else if (matchOutcome === 'loss') {
        rate -= 0.0012;
        if (wasDerby) {
            rate -= 0.0020;
            reason = 'Bronca por derrota en el clásico provoca bajas';
        }
    }

    // 4. Policy multiplier
    if (rate > 0) {
        rate *= policyMeta.growthMultiplier;
    } else if (rate < 0) {
        rate *= policyMeta.churnMultiplier;
    }

    // 5. Soft ceiling & floor so membership grows realistically without exploding infinitely
    const softCap = Math.max(
        Math.round(base * 1.90),
        Math.round(stadiumCapacity * (3.8 + (facilityLevel - 1) * 0.45))
    );
    const floor = Math.max(800, Math.round(base * 0.45));

    if (rate > 0 && current > softCap * 0.85) {
        const headroom = Math.max(0.1, (softCap - current) / (softCap * 0.15));
        rate *= Math.min(1, headroom);
    }

    let rawDelta = Math.round(current * rate);
    // Ensure noticeable feedback on clear positive/negative weeks even for smaller clubs
    if (rawDelta === 0 && Math.abs(rate) >= 0.001) {
        rawDelta = rate > 0 ? Math.max(15, Math.round(current * 0.0015)) : -Math.max(15, Math.round(current * 0.0015));
    }

    const nextActive = Math.max(floor, Math.min(softCap, current + rawDelta));
    const actualDelta = nextActive - current;

    return {
        updatedMembership: {
            ...membership,
            activeMembers: nextActive,
            lastWeeklyDelta: actualDelta,
            lastDeltaReason: reason,
            totalPeakMembers: Math.max(membership.totalPeakMembers || current, nextActive),
        },
        delta: actualDelta,
        reason,
    };
};

export type MembershipEventType =
    | 'LEAGUE_WIN'
    | 'CONTINENTAL_WIN'
    | 'CUP_WIN'
    | 'PROMOTION'
    | 'RELEGATION'
    | 'STAR_SIGNING';

export const applyMembershipEventBoost = (
    membership: ClubMembership,
    eventType: MembershipEventType,
    subjectLabel?: string
): { updatedMembership: ClubMembership; delta: number; reason: string } => {
    const current = Math.max(500, membership.activeMembers);
    const base = Math.max(1_000, membership.baseMembers);
    const hardCap = Math.round(base * 2.35);
    const floor = Math.max(800, Math.round(base * 0.42));

    let pct = 0;
    let reason = '';

    switch (eventType) {
        case 'CONTINENTAL_WIN':
            pct = 0.14;
            reason = `Gloria continental (${subjectLabel || 'Título Internacional'}): boom histórico de socios`;
            break;
        case 'LEAGUE_WIN':
            pct = 0.08;
            reason = `Campeón de Liga (${subjectLabel || 'Título Local'}): ola masiva de afiliaciones`;
            break;
        case 'PROMOTION':
            pct = 0.10;
            reason = `Ascenso de categoría: la hinchada vuelve a asociarse en masa`;
            break;
        case 'CUP_WIN':
            pct = 0.05;
            reason = `Campeón de Copa (${subjectLabel || 'Copa'}): festejo y nuevos socios`;
            break;
        case 'STAR_SIGNING':
            pct = 0.015;
            reason = `Efecto ilusión por el fichaje de ${subjectLabel || 'una figura'}`;
            break;
        case 'RELEGATION':
            pct = -0.15;
            reason = `Descenso de categoría: fuerte caída del padrón de socios`;
            break;
    }

    const rawDelta = Math.round(current * pct);
    const nextActive = Math.max(floor, Math.min(hardCap, current + rawDelta));
    const delta = nextActive - current;

    return {
        updatedMembership: {
            ...membership,
            activeMembers: nextActive,
            lastWeeklyDelta: delta,
            lastDeltaReason: reason,
            totalPeakMembers: Math.max(membership.totalPeakMembers || current, nextActive),
        },
        delta,
        reason,
    };
};
