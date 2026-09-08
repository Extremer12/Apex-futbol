import { Stadium, Sponsor, Team, FinancialBreakdown, LeagueId } from '../types';

const SPONSOR_NAMES = {
    shirt: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Umbro', 'Kappa'],
    stadium: ['Emirates', 'Etihad', 'Allianz', 'Signal Iduna', 'Spotify', 'Amazon'],
    training: ['Gatorade', 'Powerade', 'Red Bull', 'Monster Energy'],
    kit: ['Macron', 'Joma', 'Hummel', 'Erreà']
};

export const generateStadium = (team: Team): Stadium => {
    let baseCapacity = 0;
    let ticketPrice = 0;
    let maintenanceCost = 0;

    switch (team.tier) {
        case 'Top':
            baseCapacity = 50000 + Math.floor(Math.random() * 20000);
            ticketPrice = 60 + Math.floor(Math.random() * 40);
            maintenanceCost = 150000;
            break;
        case 'Mid':
            baseCapacity = 30000 + Math.floor(Math.random() * 15000);
            ticketPrice = 40 + Math.floor(Math.random() * 30);
            maintenanceCost = 80000;
            break;
        case 'Lower':
            baseCapacity = 15000 + Math.floor(Math.random() * 10000);
            ticketPrice = 25 + Math.floor(Math.random() * 20);
            maintenanceCost = 40000;
            break;
    }

    return {
        name: `${team.name} Stadium`,
        capacity: baseCapacity,
        ticketPrice,
        maintenanceCost,
        expansionCost: baseCapacity * 1000, // £1000 per seat
        expansionCapacity: Math.floor(baseCapacity * 1.2),
        facilityLevel: 1
    };
};

export const generateSponsor = (
    type: Sponsor['type'],
    tier: 'Top' | 'Mid' | 'Lower'
): Sponsor => {
    const names = SPONSOR_NAMES[type];
    const name = names[Math.floor(Math.random() * names.length)];

    let weeklyIncome = 0;
    let duration = 0;

    // Base income by tier and type
    const incomeMultipliers = {
        shirt: { Top: 500000, Mid: 200000, Lower: 50000 },
        stadium: { Top: 300000, Mid: 120000, Lower: 30000 },
        training: { Top: 150000, Mid: 60000, Lower: 15000 },
        kit: { Top: 100000, Mid: 40000, Lower: 10000 }
    };

    weeklyIncome = incomeMultipliers[type][tier] * (0.8 + Math.random() * 0.4);
    duration = 52 * (2 + Math.floor(Math.random() * 3)); // 2-4 years

    // Add performance bonus for some sponsors
    const hasBonus = Math.random() > 0.5;
    let bonusCondition: 'top4' | 'top6' | 'promotion';
    if (tier === 'Top') bonusCondition = 'top4';
    else if (tier === 'Mid') bonusCondition = 'top6';
    else bonusCondition = 'promotion';

    const bonus = hasBonus ? {
        condition: bonusCondition,
        amount: weeklyIncome * 0.5
    } : undefined;

    return {
        id: `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        logo: type === 'shirt' ? '👕' : type === 'stadium' ? '🏟️' : type === 'training' ? '🥤' : '👟',
        weeklyIncome: Math.floor(weeklyIncome),
        duration,
        bonus
    };
};

export const generateSponsorMarket = (tier: 'Top' | 'Mid' | 'Lower'): Sponsor[] => {
    const sponsors: Sponsor[] = [];

    // Generate 2-3 offers per type
    const types: Sponsor['type'][] = ['shirt', 'stadium', 'training', 'kit'];
    types.forEach(type => {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            sponsors.push(generateSponsor(type, tier));
        }
    });

    return sponsors;
};

export const calculateMatchdayRevenue = (
    stadium: Stadium,
    leaguePosition: number,
    isCupMatch: boolean = false
): number => {
    // Attendance based on position
    let attendanceRate = 0.7; // Base 70%
    if (leaguePosition <= 4) attendanceRate = 0.95;
    else if (leaguePosition <= 10) attendanceRate = 0.85;
    else if (leaguePosition >= 18) attendanceRate = 0.6;

    if (isCupMatch) attendanceRate = Math.min(1, attendanceRate + 0.1);

    const attendance = Math.floor(stadium.capacity * attendanceRate);
    
    // Facility Level bonus (Level 1: 1.0x, Level 5: 1.5x)
    const facilityMultiplier = 1 + (stadium.facilityLevel - 1) * 0.125;
    
    return Math.floor(attendance * stadium.ticketPrice * facilityMultiplier);
};

export const calculateFinancialBreakdown = (
    team: Team,
    stadium: Stadium,
    sponsors: Sponsor[],
    leaguePosition: number,
    transfersThisWeek: { bought: number; sold: number },
    wasHomeMatch: boolean,
    leagueId: string
): FinancialBreakdown => {
    // Ingresos
    const matchdayRevenue = wasHomeMatch ? calculateMatchdayRevenue(stadium, leaguePosition) : 0;
    const sponsorshipRevenue = sponsors.reduce((sum, s) => sum + s.weeklyIncome, 0);
    const tvRevenue = getBaseWeeklyIncome(leagueId);
    const prizeMoneyRevenue = 0; // Calculated at end of season
    const transferRevenue = transfersThisWeek.sold;

    // Gastos
    const wageExpenses = team.squad.reduce((sum, p) => sum + p.wage, 0);
    const coachExpenses = team.coach?.salary || 0;
    const stadiumExpenses = stadium.maintenanceCost;
    
    // Scale operational expenses by tier
    const operationalExpenses = team.tier === 'Top' ? 250000 : team.tier === 'Mid' ? 100000 : 40000;
    
    const transferExpenses = transfersThisWeek.bought;

    return {
        matchdayRevenue,
        sponsorshipRevenue,
        tvRevenue,
        prizeMoneyRevenue,
        transferRevenue,
        wageExpenses,
        coachExpenses,
        stadiumExpenses,
        operationalExpenses,
        transferExpenses
    };
};

export const getNetWeeklyIncome = (breakdown: FinancialBreakdown): number => {
    const income = breakdown.matchdayRevenue + breakdown.sponsorshipRevenue +
        breakdown.tvRevenue + breakdown.prizeMoneyRevenue + breakdown.transferRevenue;
    const expenses = breakdown.wageExpenses + breakdown.coachExpenses +
        breakdown.stadiumExpenses + breakdown.operationalExpenses +
        breakdown.transferExpenses;
    return income - expenses;
};

/**
 * Calculate base weekly income based on league
 * Scaled realistically across all 14 available leagues
 */
export const getBaseWeeklyIncome = (leagueId: string): number => {
    switch (leagueId) {
        case LeagueId.PREMIER_LEAGUE:
        case 'PREMIER_LEAGUE':
            return 2_200_000;
        case LeagueId.CHAMPIONSHIP:
        case 'CHAMPIONSHIP':
            return 650_000;
        case LeagueId.LA_LIGA:
        case 'LA_LIGA':
            return 1_800_000;
        case LeagueId.SEGUNDA_DIVISION_ESP:
        case 'SEGUNDA_DIVISION_ESP':
            return 450_000;
        case LeagueId.BUNDESLIGA:
        case 'BUNDESLIGA':
            return 1_900_000;
        case LeagueId.ZWEITE_BUNDESLIGA:
        case 'ZWEITE_BUNDESLIGA':
            return 500_000;
        case LeagueId.SERIE_A:
        case 'SERIE_A':
            return 1_700_000;
        case LeagueId.SERIE_B_ITA:
        case 'SERIE_B_ITA':
            return 400_000;
        case LeagueId.LIGUE_1:
        case 'LIGUE_1':
            return 1_500_000;
        case LeagueId.LIGUE_2:
        case 'LIGUE_2':
            return 350_000;
        case LeagueId.BRASILEIRAO:
        case 'BRASILEIRAO':
            return 750_000;
        case LeagueId.SERIE_B_BR:
        case 'SERIE_B_BR':
            return 220_000;
        case LeagueId.LIGA_ARGENTINA:
        case 'LIGA_ARGENTINA':
            return 550_000;
        case LeagueId.PRIMERA_NACIONAL:
        case 'PRIMERA_NACIONAL':
            return 160_000;
        case LeagueId.COPA_DE_PRIMERA:
        case 'COPA_DE_PRIMERA':
            return 400_000;
        default:
            return 500_000;
    }
};

/**
 * Calculate end-of-season prize money based on position and league
 */
export const calculatePrizeMoney = (leagueId: string, position: number): number => {
    let baseAmount = 0;
    switch (leagueId) {
        case LeagueId.PREMIER_LEAGUE:
        case 'PREMIER_LEAGUE':
            baseAmount = 160_000_000; break;
        case LeagueId.CHAMPIONSHIP:
        case 'CHAMPIONSHIP':
            baseAmount = 45_000_000; break;
        case LeagueId.LA_LIGA:
        case 'LA_LIGA':
            baseAmount = 130_000_000; break;
        case LeagueId.SEGUNDA_DIVISION_ESP:
        case 'SEGUNDA_DIVISION_ESP':
            baseAmount = 25_000_000; break;
        case LeagueId.BUNDESLIGA:
        case 'BUNDESLIGA':
            baseAmount = 135_000_000; break;
        case LeagueId.ZWEITE_BUNDESLIGA:
        case 'ZWEITE_BUNDESLIGA':
            baseAmount = 30_000_000; break;
        case LeagueId.SERIE_A:
        case 'SERIE_A':
            baseAmount = 120_000_000; break;
        case LeagueId.SERIE_B_ITA:
        case 'SERIE_B_ITA':
            baseAmount = 20_000_000; break;
        case LeagueId.LIGUE_1:
        case 'LIGUE_1':
            baseAmount = 110_000_000; break;
        case LeagueId.LIGUE_2:
        case 'LIGUE_2':
            baseAmount = 18_000_000; break;
        case LeagueId.BRASILEIRAO:
        case 'BRASILEIRAO':
            baseAmount = 50_000_000; break;
        case LeagueId.SERIE_B_BR:
        case 'SERIE_B_BR':
            baseAmount = 12_000_000; break;
        case LeagueId.LIGA_ARGENTINA:
        case 'LIGA_ARGENTINA':
            baseAmount = 35_000_000; break;
        case LeagueId.PRIMERA_NACIONAL:
        case 'PRIMERA_NACIONAL':
            baseAmount = 8_000_000; break;
        case LeagueId.COPA_DE_PRIMERA:
        case 'COPA_DE_PRIMERA':
            baseAmount = 20_000_000; break;
        default:
            baseAmount = 25_000_000;
    }

    // Distribute based on position (roughly)
    // 1st gets ~25% of pool, decreasing down to lower positions
    const multiplier = Math.max(0.05, 0.25 - (position - 1) * 0.01);
    return Math.floor(baseAmount * multiplier);
};
