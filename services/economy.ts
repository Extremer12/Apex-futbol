import { Stadium, Sponsor, Team, FinancialBreakdown, LeagueId, SponsorSector, SponsorPrestige, TicketPolicy, BankLoan, ClubDirectives } from '../types';
import { getTeamStadium } from '../data/stadiums';

export interface BrandDefinition {
    name: string;
    type: Sponsor['type'];
    sector: SponsorSector;
    prestige: SponsorPrestige;
    brandColor: string;
    description: string;
    fanApprovalImpact: number;
    clauses: string[];
    allowedTiers?: ('Top' | 'Mid' | 'Lower')[];
}

export const BRAND_CATALOG: BrandDefinition[] = [
    // --- Camiseta Principal (Shirt) ---
    {
        name: 'Fly Emirates',
        type: 'shirt',
        sector: 'airline',
        prestige: 'Global',
        brandColor: '#D71920',
        description: 'Aerolínea internacional de lujo de Oriente Medio con máxima proyección mundial.',
        fanApprovalImpact: 0,
        clauses: ['Exige clasificación a Copa Continental', 'Penalización 20% si el equipo desciende']
    },
    {
        name: 'Spotify',
        type: 'shirt',
        sector: 'tech',
        prestige: 'Global',
        brandColor: '#1DB954',
        description: 'Gigante sueco de streaming musical con impacto masivo en audiencia joven.',
        fanApprovalImpact: 2,
        clauses: ['Bono por partidos de máxima audiencia']
    },
    {
        name: 'Allianz Group',
        type: 'shirt',
        sector: 'banking',
        prestige: 'Global',
        brandColor: '#003780',
        description: 'Consorcio financiero y asegurador multinacional con solvencia garantizada.',
        fanApprovalImpact: 0,
        clauses: ['Cláusula de solvencia: prohíbe incurrir en déficit']
    },
    {
        name: 'Stake Sports',
        type: 'shirt',
        sector: 'betting',
        prestige: 'Continental',
        brandColor: '#1475E1',
        description: 'Plataforma internacional de casino online y apuestas. Paga cifras récord pero genera recelo ético.',
        fanApprovalImpact: -6,
        clauses: ['Aumento de prima fija del 25%', 'Rechazo de sectores conservadores de la masa societaria']
    },
    {
        name: 'Pirelli',
        type: 'shirt',
        sector: 'automotive',
        prestige: 'Continental',
        brandColor: '#FFE500',
        description: 'Histórica firma italiana de neumáticos vinculada a la élite deportiva del motor.',
        fanApprovalImpact: 1,
        clauses: ['Bono por victorias en derbis y clásicos']
    },
    {
        name: 'Rakuten',
        type: 'shirt',
        sector: 'tech',
        prestige: 'Global',
        brandColor: '#BF0000',
        description: 'Conglomerado tecnológico de comercio electrónico y servicios digitales.',
        fanApprovalImpact: 0,
        clauses: ['Bono si el equipo finaliza en el Top 6']
    },
    {
        name: 'Cervecería Quilmes',
        type: 'shirt',
        sector: 'beverage',
        prestige: 'Regional',
        brandColor: '#005BAA',
        description: 'Marca cervecera tradicional emblemática con enorme arraigo y cariño popular entre los hinchas.',
        fanApprovalImpact: 5,
        clauses: ['Bono de celebración por permanencia o títulos']
    },
    {
        name: 'Estrella Galicia',
        type: 'shirt',
        sector: 'beverage',
        prestige: 'Regional',
        brandColor: '#C41230',
        description: 'Cerveza de tradición artesanal con altísima estima y fidelidad en la afición.',
        fanApprovalImpact: 5,
        clauses: ['Bono por alcanzar rondas finales de copa nacional']
    },
    {
        name: 'Banco Santander',
        type: 'shirt',
        sector: 'banking',
        prestige: 'Global',
        brandColor: '#EC0000',
        description: 'Entidad financiera de referencia global con presencia masiva en torneos oficiales.',
        fanApprovalImpact: 0,
        clauses: ['Auditoría semestral de estabilidad económica']
    },
    {
        name: 'Betway Sports',
        type: 'shirt',
        sector: 'betting',
        prestige: 'Continental',
        brandColor: '#00A826',
        description: 'Operador de pronósticos deportivos con fuerte presupuesto comercial inmediato.',
        fanApprovalImpact: -5,
        clauses: ['Bono por partidos invicto como local']
    },
    {
        name: 'Red Bull',
        type: 'shirt',
        sector: 'beverage',
        prestige: 'Global',
        brandColor: '#DA291C',
        description: 'Multinacional de bebidas energéticas enfocada en ritmo vertiginoso y juventud.',
        fanApprovalImpact: -2,
        clauses: ['Exige promedio de edad de plantilla inferior a 27 años']
    },

    // --- Proveedor Técnico (Kit) ---
    {
        name: 'Nike',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Global',
        brandColor: '#FFFFFF',
        description: 'El coloso mundial del calzado y ropa técnica deportiva con distribución mundial inigualable.',
        fanApprovalImpact: 2,
        clauses: ['Regalías del 10% adicional por merchandising']
    },
    {
        name: 'Adidas',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Global',
        brandColor: '#E5E5E5',
        description: 'La leyenda de las tres tiras. Sinónimo de grandeza e historia en el fútbol europeo y sudamericano.',
        fanApprovalImpact: 2,
        clauses: ['Bono por clasificar a torneos internacionales']
    },
    {
        name: 'Puma',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Global',
        brandColor: '#FF7300',
        description: 'Firma alemana de innovación estética, velocidad y diseños modernos para la juventud.',
        fanApprovalImpact: 1,
        clauses: ['Bono por jugador joven canterano titular']
    },
    {
        name: 'Kappa',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Regional',
        brandColor: '#1E3A8A',
        description: 'Marca retro italiana de culto venerada por los coleccionistas de indumentaria futbolística.',
        fanApprovalImpact: 4,
        clauses: ['Bono por fidelidad societaria']
    },
    {
        name: 'Umbro',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Regional',
        brandColor: '#002B49',
        description: 'Pioneros ingleses de la vestimenta tradicional de fútbol con herencia centenaria.',
        fanApprovalImpact: 3,
        clauses: ['Bono por victorias en el estadio propio']
    },
    {
        name: 'Macron',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Continental',
        brandColor: '#0284C7',
        description: 'Especialistas europeos en confección técnica de alta calidad para clubes competitivos.',
        fanApprovalImpact: 0,
        clauses: ['Descuento del 15% en costos de vestuario']
    },
    {
        name: 'Joma',
        type: 'kit',
        sector: 'apparel',
        prestige: 'Regional',
        brandColor: '#0284C7',
        description: 'Empresa española con enorme confiabilidad y excelente ratio coste/beneficio para ligas nacionales.',
        fanApprovalImpact: 2,
        clauses: ['Bono por evitar el descenso']
    },

    // --- Naming Rights Estadio (Stadium) ---
    {
        name: 'Allianz',
        type: 'stadium',
        sector: 'banking',
        prestige: 'Global',
        brandColor: '#003780',
        description: 'Red global de estadios vanguardistas con arquitectura de referencia planetaria.',
        fanApprovalImpact: 1,
        clauses: ['Contrato a largo plazo de máxima estabilidad']
    },
    {
        name: 'Emirates Ground',
        type: 'stadium',
        sector: 'airline',
        prestige: 'Global',
        brandColor: '#D71920',
        description: 'Denominación aerocomercial con remodelación de zonas de hospitalidad VIP.',
        fanApprovalImpact: 0,
        clauses: ['Inversión adicional en infraestructura de palcos']
    },
    {
        name: 'Spotify Park',
        type: 'stadium',
        sector: 'tech',
        prestige: 'Global',
        brandColor: '#1DB954',
        description: 'Concepto de estadio conectado a conciertos musicales y experiencias inmersivas.',
        fanApprovalImpact: 2,
        clauses: ['Bono por afluencia superior al 90%']
    },
    {
        name: 'Etihad Stadium',
        type: 'stadium',
        sector: 'airline',
        prestige: 'Global',
        brandColor: '#D9A74A',
        description: 'Naming rights institucional con gran respaldo de capital e infraestructuras anexas.',
        fanApprovalImpact: 0,
        clauses: ['Renovación automática sujeta a títulos']
    },
    {
        name: 'Amazon Prime Arena',
        type: 'stadium',
        sector: 'tech',
        prestige: 'Global',
        brandColor: '#00A8E1',
        description: 'Asociación tecnológica para transmisiones en alta definición y eventos globales.',
        fanApprovalImpact: 1,
        clauses: ['Bono por partidos transmitidos en prime time']
    },
    {
        name: 'Estadio Cervecería Mahou / Quilmes',
        type: 'stadium',
        sector: 'beverage',
        prestige: 'Regional',
        brandColor: '#B91C1C',
        description: 'Naming tradicional que respeta la mística y reduce precios de bebidas para los hinchas.',
        fanApprovalImpact: 5,
        clauses: ['Cláusula popular: precios accesibles en cantinas']
    },

    // --- Secundario / Manga / Ciudad Deportiva (Training) ---
    {
        name: 'Gatorade',
        type: 'training',
        sector: 'beverage',
        prestige: 'Global',
        brandColor: '#FF6600',
        description: 'Nutrición científica e hidratación oficial en campos de entrenamiento y banco de suplentes.',
        fanApprovalImpact: 2,
        clauses: ['Bono si el equipo mantiene alta condición física']
    },
    {
        name: 'Monster Energy',
        type: 'training',
        sector: 'beverage',
        prestige: 'Global',
        brandColor: '#74FF00',
        description: 'Patrocinio dinámico en manga de camiseta para deportes de alta intensidad.',
        fanApprovalImpact: 0,
        clauses: ['Bono por racha de 3 partidos invictos']
    },
    {
        name: 'DHL Express',
        type: 'training',
        sector: 'tech',
        prestige: 'Global',
        brandColor: '#FFCC00',
        description: 'Logística global encargada del transporte y equipamiento en giras del club.',
        fanApprovalImpact: 1,
        clauses: ['Bono por desplazamientos internacionales']
    },
    {
        name: 'Visit Tourism Board',
        type: 'training',
        sector: 'airline',
        prestige: 'Continental',
        brandColor: '#0284C7',
        description: 'Promoción turística internacional en manga de camiseta de juego.',
        fanApprovalImpact: -2,
        clauses: ['Exige partidos en torneos televisados']
    },
    {
        name: 'Beko Home',
        type: 'training',
        sector: 'tech',
        prestige: 'Continental',
        brandColor: '#006699',
        description: 'Equipamiento de cocina y acondicionamiento para la residencia del club y cantera.',
        fanApprovalImpact: 1,
        clauses: ['Bono por canteranos debutantes']
    },
    {
        name: 'Motors Regional',
        type: 'training',
        sector: 'automotive',
        prestige: 'Regional',
        brandColor: '#475569',
        description: 'Concesionaria regional que provee vehículos para traslados oficiales y directivos.',
        fanApprovalImpact: 3,
        clauses: ['Bono por compromiso de patrocinio local']
    }
];

export const generateStadium = (team: Team): Stadium => {
    const info = getTeamStadium(team);
    const capacity = info.capacity;

    const isSouthAm = [
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA, LeagueId.PRIMERA_DIVISION_CHILE, LeagueId.PRIMERA_B_CHILE
    ].includes(team.leagueId as LeagueId);

    const isMex = [LeagueId.LIGA_MX, LeagueId.LIGA_EXPANSION_MX].includes(team.leagueId as LeagueId);

    let ticketPrice = 25;
    if (isSouthAm) {
        ticketPrice = team.tier === 'Top' ? 18 : team.tier === 'Mid' ? 12 : 8;
    } else if (isMex) {
        ticketPrice = team.tier === 'Top' ? 25 : team.tier === 'Mid' ? 18 : 12;
    } else {
        switch (team.tier) {
            case 'Top': ticketPrice = 50; break;
            case 'Mid': ticketPrice = 35; break;
            case 'Lower': ticketPrice = 20; break;
        }
    }

    const maintenanceCost = Math.max(10000, Math.floor(capacity * (isSouthAm ? 1.2 : 2.5)));

    return {
        name: info.name,
        capacity,
        city: info.city,
        ticketPrice,
        maintenanceCost,
        expansionCost: capacity * (isSouthAm ? 400 : 1000),
        expansionCapacity: Math.floor(capacity * 1.2),
        facilityLevel: 1
    };
};

export const generateSponsor = (
    type: Sponsor['type'],
    tier: 'Top' | 'Mid' | 'Lower',
    leagueId?: string
): Sponsor => {
    const isSouthAm = leagueId && [
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA, LeagueId.PRIMERA_DIVISION_CHILE, LeagueId.PRIMERA_B_CHILE,
        'LIGA_ARGENTINA', 'PRIMERA_NACIONAL', 'BRASILEIRAO', 'SERIE_B_BR', 'COPA_DE_PRIMERA'
    ].includes(leagueId as any);

    const isMex = leagueId && [LeagueId.LIGA_MX, LeagueId.LIGA_EXPANSION_MX, 'LIGA_MX'].includes(leagueId as any);
    const regionScale = isSouthAm ? 0.18 : isMex ? 0.38 : 1.0;

    // Filter brands from catalog suitable for this type and tier
    let candidates = BRAND_CATALOG.filter(b => b.type === type);
    if (tier === 'Lower') {
        candidates = candidates.filter(b => b.prestige !== 'Global' || Math.random() > 0.6);
    } else if (tier === 'Top') {
        candidates = candidates.filter(b => b.prestige !== 'Regional' || Math.random() > 0.7);
    }
    if (candidates.length === 0) {
        candidates = BRAND_CATALOG.filter(b => b.type === type);
    }

    const brandDef = candidates[Math.floor(Math.random() * candidates.length)];

    // Base income by tier and type (European baseline)
    const incomeMultipliers = {
        shirt: { Top: 520000, Mid: 210000, Lower: 55000 },
        stadium: { Top: 320000, Mid: 130000, Lower: 35000 },
        training: { Top: 160000, Mid: 65000, Lower: 16000 },
        kit: { Top: 110000, Mid: 45000, Lower: 12000 }
    };

    let baseRate = incomeMultipliers[type][tier] * regionScale * (0.88 + Math.random() * 0.28);

    // Betting brands offer ~25% premium cash
    if (brandDef.sector === 'betting') {
        baseRate *= 1.25;
    }

    const weeklyIncome = Math.floor(baseRate);
    const durationWeeks = 52 * (1 + Math.floor(Math.random() * 3)); // 1-3 years (52, 104, 156 weeks)
    const signingBonus = Math.floor(weeklyIncome * (3 + Math.floor(Math.random() * 3))); // 3-5 weeks bonus

    // Add performance bonus for some sponsors
    const hasBonus = Math.random() > 0.35;
    let bonusCondition: 'top4' | 'top6' | 'promotion' | 'win_cup';
    if (tier === 'Top') bonusCondition = Math.random() > 0.5 ? 'top4' : 'win_cup';
    else if (tier === 'Mid') bonusCondition = Math.random() > 0.5 ? 'top6' : 'top4';
    else bonusCondition = 'promotion';

    const bonus = hasBonus ? {
        condition: bonusCondition,
        amount: Math.floor(weeklyIncome * 6)
    } : undefined;

    return {
        id: `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: brandDef.name,
        type,
        logo: type,
        weeklyIncome,
        duration: durationWeeks,
        bonus,
        sector: brandDef.sector,
        prestige: brandDef.prestige,
        signingBonus,
        fanApprovalImpact: brandDef.fanApprovalImpact,
        clauses: brandDef.clauses,
        brandColor: brandDef.brandColor,
        description: brandDef.description
    };
};

export const generateSponsorMarket = (tier: 'Top' | 'Mid' | 'Lower', leagueId?: string): Sponsor[] => {
    const sponsors: Sponsor[] = [];
    const types: Sponsor['type'][] = ['shirt', 'kit', 'stadium', 'training'];

    types.forEach(type => {
        const count = 2 + Math.floor(Math.random() * 2); // 2-3 offers per category
        for (let i = 0; i < count; i++) {
            sponsors.push(generateSponsor(type, tier, leagueId));
        }
    });

    return sponsors;
};

export const calculateMatchdayRevenue = (
    stadium: Stadium,
    leaguePosition: number,
    isCupMatch: boolean = false,
    ticketPolicy: TicketPolicy = 'standard'
): number => {
    let attendanceRate = 0.70;
    if (leaguePosition <= 4) attendanceRate = 0.95;
    else if (leaguePosition <= 10) attendanceRate = 0.85;
    else if (leaguePosition >= 18) attendanceRate = 0.58;

    if (isCupMatch) attendanceRate = Math.min(1.0, attendanceRate + 0.12);

    let priceMultiplier = 1.0;
    if (ticketPolicy === 'cheap') {
        priceMultiplier = 0.75;
        attendanceRate = Math.min(1.0, attendanceRate + 0.20);
    } else if (ticketPolicy === 'premium') {
        priceMultiplier = 1.35;
        const penalty = leaguePosition > 8 ? 0.22 : 0.12;
        attendanceRate = Math.max(0.35, attendanceRate - penalty);
    }

    const attendance = Math.floor(stadium.capacity * attendanceRate);
    const facilityMultiplier = 1 + (stadium.facilityLevel - 1) * 0.125;

    return Math.floor(attendance * (stadium.ticketPrice * priceMultiplier) * facilityMultiplier);
};

export const calculateFinancialBreakdown = (
    team: Team,
    stadium: Stadium,
    sponsors: Sponsor[],
    leaguePosition: number,
    transfersThisWeek: { bought: number; sold: number },
    wasHomeMatch: boolean,
    leagueId: string,
    ticketPolicy: TicketPolicy = 'standard',
    activeLoans: BankLoan[] = [],
    clubDirectives?: ClubDirectives
): FinancialBreakdown => {
    const isSouthAm = [
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA, LeagueId.PRIMERA_DIVISION_CHILE, LeagueId.PRIMERA_B_CHILE
    ].includes(leagueId as any);

    // Ingresos
    const matchdayRevenue = wasHomeMatch ? calculateMatchdayRevenue(stadium, leaguePosition, false, ticketPolicy) : 0;
    const sponsorshipRevenue = sponsors.reduce((sum, s) => sum + s.weeklyIncome, 0);
    const tvRevenue = getBaseWeeklyIncome(leagueId);
    const prizeMoneyRevenue = 0;
    const transferRevenue = transfersThisWeek.sold;

    // Directiva de Marketing Global & Merchandising
    let merchandisingRevenue = 0;
    let merchandisingExpenses = 0;
    if (clubDirectives?.globalMarketing) {
        merchandisingExpenses = isSouthAm ? 8_000 : 25_000;
        const top5SquadAvg = team.squad.length > 0 
            ? team.squad.slice().sort((a, b) => b.rating - a.rating).slice(0, 5).reduce((s, p) => s + p.rating, 0) / Math.min(5, team.squad.length)
            : 70;
        const starBoost = Math.max(1, (top5SquadAvg - 65) / 10);
        merchandisingRevenue = Math.floor((isSouthAm ? 20_000 : 75_000) * starBoost);
    }

    // Directiva de Cantera
    let youthAcademyExpenses = 0;
    if (clubDirectives?.youthInvestment === 'medium') {
        youthAcademyExpenses = isSouthAm ? 6_000 : 22_000;
    } else if (clubDirectives?.youthInvestment === 'high') {
        youthAcademyExpenses = isSouthAm ? 18_000 : 65_000;
    }

    // Cuotas de préstamos bancarios
    const loanExpenses = activeLoans.reduce((sum, l) => sum + (l.remainingWeeks > 0 ? l.weeklyPayment : 0), 0);

    // Gastos
    const wageExpenses = team.squad.reduce((sum, p) => sum + p.wage, 0);
    const coachExpenses = team.coach?.salary || 0;
    const stadiumExpenses = stadium.maintenanceCost;
    const operationalExpenses = team.tier === 'Top' ? 250000 : team.tier === 'Mid' ? 100000 : 40000;
    const transferExpenses = transfersThisWeek.bought;

    return {
        matchdayRevenue,
        sponsorshipRevenue,
        tvRevenue,
        prizeMoneyRevenue,
        transferRevenue,
        merchandisingRevenue,
        wageExpenses,
        coachExpenses,
        stadiumExpenses,
        operationalExpenses,
        transferExpenses,
        loanExpenses,
        youthAcademyExpenses,
        merchandisingExpenses
    };
};

export const getNetWeeklyIncome = (breakdown: FinancialBreakdown): number => {
    const income = breakdown.matchdayRevenue + breakdown.sponsorshipRevenue +
        breakdown.tvRevenue + breakdown.prizeMoneyRevenue + breakdown.transferRevenue +
        (breakdown.merchandisingRevenue || 0);

    const expenses = breakdown.wageExpenses + breakdown.coachExpenses +
        breakdown.stadiumExpenses + breakdown.operationalExpenses +
        breakdown.transferExpenses +
        (breakdown.loanExpenses || 0) +
        (breakdown.youthAcademyExpenses || 0) +
        (breakdown.merchandisingExpenses || 0);

    return income - expenses;
};

export const getAvailableLoans = (team: Team, leagueId: string): BankLoan[] => {
    const isSouthAm = [
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA, LeagueId.PRIMERA_DIVISION_CHILE, LeagueId.PRIMERA_B_CHILE
    ].includes(leagueId as any);

    const isMex = [LeagueId.LIGA_MX, LeagueId.LIGA_EXPANSION_MX].includes(leagueId as any);
    const scale = isSouthAm ? 0.20 : isMex ? 0.40 : 1.0;

    const microPrincipal = Math.floor((team.tier === 'Top' ? 8_000_000 : team.tier === 'Mid' ? 3_500_000 : 1_500_000) * scale);
    const expansionPrincipal = Math.floor((team.tier === 'Top' ? 25_000_000 : team.tier === 'Mid' ? 10_000_000 : 4_000_000) * scale);
    const structuralPrincipal = Math.floor((team.tier === 'Top' ? 60_000_000 : team.tier === 'Mid' ? 25_000_000 : 8_000_000) * scale);

    return [
        {
            id: 'loan_micro',
            name: 'Línea de Tesorería Inmediata',
            principal: microPrincipal,
            remainingAmount: Math.floor(microPrincipal * 1.06),
            weeklyPayment: Math.ceil((microPrincipal * 1.06) / 24),
            remainingWeeks: 24,
            interestRate: 0.06
        },
        {
            id: 'loan_expansion',
            name: 'Préstamo de Mercado e Inversión',
            principal: expansionPrincipal,
            remainingAmount: Math.floor(expansionPrincipal * 1.05),
            weeklyPayment: Math.ceil((expansionPrincipal * 1.05) / 52),
            remainingWeeks: 52,
            interestRate: 0.05
        },
        {
            id: 'loan_structural',
            name: 'Crédito Estructural de Infraestructura',
            principal: structuralPrincipal,
            remainingAmount: Math.floor(structuralPrincipal * 1.045),
            weeklyPayment: Math.ceil((structuralPrincipal * 1.045) / 78),
            remainingWeeks: 78,
            interestRate: 0.045
        }
    ];
};

export interface FinancialHealthEvaluation {
    grade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'C';
    label: string;
    description: string;
    color: string;
    totalDebt: number;
    projectedEndBalance: number;
    fairPlayCompliant: boolean;
}

export const evaluateFinancialHealth = (
    finances: { balance: number; activeLoans?: BankLoan[] },
    netWeeklyIncome: number,
    weeksRemainingInSeason: number = 30
): FinancialHealthEvaluation => {
    const totalDebt = (finances.activeLoans || []).reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
    const projectedEndBalance = finances.balance + (netWeeklyIncome * weeksRemainingInSeason);

    let grade: FinancialHealthEvaluation['grade'] = 'A';
    let label = 'Estabilidad Financiera';
    let description = 'El club mantiene cuentas equilibradas con márgenes operativos controlados.';
    let color = '#38BDF8';
    let fairPlayCompliant = true;

    if (finances.balance < 0) {
        grade = 'C';
        label = 'Déficit Crítico / Alerta';
        description = 'El balance general está en rojo. La directiva exige recortes o ventas de jugadores.';
        color = 'var(--apex-red)';
        fairPlayCompliant = false;
    } else if (totalDebt > finances.balance * 2.5 && netWeeklyIncome < 0) {
        grade = 'BB';
        label = 'Riesgo de Endeudamiento';
        description = 'El volumen de préstamos activos y el flujo de caja negativo comprometen la liquidez.';
        color = '#F97316';
        fairPlayCompliant = false;
    } else if (netWeeklyIncome > 200_000 && finances.balance > 15_000_000 && totalDebt === 0) {
        grade = 'AAA';
        label = 'Máxima Solvencia';
        description = 'Excelente capacidad financiera, superávit holgado y nulo endeudamiento bancario.';
        color = 'var(--apex-green)';
    } else if (netWeeklyIncome >= 50_000 && finances.balance > 5_000_000) {
        grade = 'AA';
        label = 'Solidez Notable';
        description = 'Finanzas saludables y capacidad de maniobra para afrontar fichajes e infraestructura.';
        color = 'var(--apex-gold)';
    } else if (netWeeklyIncome < 0) {
        grade = 'BBB';
        label = 'Bajo Observación';
        description = 'Gastos semanales superiores a los ingresos regulares. Dependiente de taquillas o ventas.';
        color = '#FBBF24';
    }

    return {
        grade,
        label,
        description,
        color,
        totalDebt,
        projectedEndBalance,
        fairPlayCompliant
    };
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
            return 160_000;
        case LeagueId.SERIE_B_BR:
        case 'SERIE_B_BR':
            return 40_000;
        case LeagueId.LIGA_ARGENTINA:
        case 'LIGA_ARGENTINA':
            return 85_000;
        case LeagueId.PRIMERA_NACIONAL:
        case 'PRIMERA_NACIONAL':
            return 22_000;
        case LeagueId.COPA_DE_PRIMERA:
        case 'COPA_DE_PRIMERA':
            return 30_000;
        case LeagueId.LIGA_MX:
        case 'LIGA_MX':
            return 220_000;
        case LeagueId.LIGA_EXPANSION_MX:
        case 'LIGA_EXPANSION_MX':
            return 35_000;
        case LeagueId.PRIMERA_DIVISION_CHILE:
        case 'PRIMERA_DIVISION_CHILE':
            return 35_000;
        case LeagueId.PRIMERA_B_CHILE:
        case 'PRIMERA_B_CHILE':
            return 15_000;
        default:
            return 250_000;
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
            baseAmount = 20_000_000; break;
        case LeagueId.SERIE_B_BR:
        case 'SERIE_B_BR':
            baseAmount = 4_000_000; break;
        case LeagueId.LIGA_ARGENTINA:
        case 'LIGA_ARGENTINA':
            baseAmount = 12_000_000; break;
        case LeagueId.PRIMERA_NACIONAL:
        case 'PRIMERA_NACIONAL':
            baseAmount = 2_000_000; break;
        case LeagueId.COPA_DE_PRIMERA:
        case 'COPA_DE_PRIMERA':
            baseAmount = 4_000_000; break;
        case LeagueId.LIGA_MX:
        case 'LIGA_MX':
            baseAmount = 15_000_000; break;
        case LeagueId.LIGA_EXPANSION_MX:
        case 'LIGA_EXPANSION_MX':
            baseAmount = 3_000_000; break;
        case LeagueId.PRIMERA_DIVISION_CHILE:
        case 'PRIMERA_DIVISION_CHILE':
            baseAmount = 5_000_000; break;
        case LeagueId.PRIMERA_B_CHILE:
        case 'PRIMERA_B_CHILE':
            baseAmount = 1_500_000; break;
        default:
            baseAmount = 10_000_000;
    }

    const multiplier = Math.max(0.05, 0.25 - (position - 1) * 0.01);
    return Math.floor(baseAmount * multiplier);
};
