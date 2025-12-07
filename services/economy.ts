import { Stadium, Sponsor, Team, FinancialBreakdown } from '../types';

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
        expansionCapacity: Math.floor(baseCapacity * 1.2)
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
    return attendance * stadium.ticketPrice;
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
    const operationalExpenses = 50000; // Fixed weekly operational costs
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
 * Premier League teams earn more than Championship, which earn more than La Liga (in this game)
 */
export const getBaseWeeklyIncome = (leagueId: string): number => {
    switch (leagueId) {
        case 'PREMIER_LEAGUE':
            return 2_500_000; // £2.5M per week (TV rights + base income)
        case 'CHAMPIONSHIP':
            return 800_000;   // £800K per week
        case 'LA_LIGA':
            return 2_000_000; // £2M per week
        default:
            return 1_000_000; // Default fallback
    }
};
