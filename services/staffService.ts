import { StaffMember, StaffRole, ClubStaff, Coach, LeagueId } from '../types';

const FIRST_NAMES = [
    'Alejandro', 'Mateo', 'Carlos', 'Guillermo', 'Lucas', 'Julian', 'Marco', 'Andrea', 'Hans', 'Jürgen',
    'Pierre', 'Antoine', 'David', 'Arthur', 'Rodrigo', 'Thiago', 'Facundo', 'Mariano', 'Sebastián', 'Enrique'
];

const LAST_NAMES = [
    'Navarro', 'Benítez', 'Santoro', 'Mancini', 'Kaufmann', 'Dupont', 'Fischer', 'Albuquerque', 'Silva',
    'Herrera', 'Villalba', 'Fontana', 'Rossi', 'Méndez', 'Castillo', 'Bauer', 'Moreno', 'Lombardi', 'Pérez'
];

const DOCTOR_SPECIALTIES = [
    'Prevención de Roturas Fibrilares',
    'Especialista en Meniscos y Ligamentos',
    'Medicina Regenerativa y Células Madre',
    'Traumatología Deportiva Avanzada',
    'Rehabilitación Biomecánica Acelerada',
    'Control y Diagnóstico Precoz por Resonancia'
];

const FITNESS_SPECIALTIES = [
    'Periodización Táctica y Cargas de Élite',
    'Resistencia de Alta Intensidad (HIIT)',
    'Prevención Muscular y Fuerza Funcional',
    'Monitoreo Biométrico y Métricas GPS',
    'Recuperación Metabólica Post-Partido',
    'Acondicionamiento Físico en Calendarios Saturados'
];

const SPORTING_DIRECTOR_SPECIALTIES = [
    'Negociador Implacable en Cláusulas',
    'Red Global de Contactos con Agentes FIFA',
    'Cazatalentos de Futbolistas Subvalorados',
    'Especialista en Ventas de Jugadores Descartados',
    'Estructuración Financiera de Contratos',
    'Vínculos de Cesión con Grandes Clubes Europeos'
];

const YOUTH_COACH_SPECIALTIES = [
    'Formador de Wonderkids y Nuevas Joyas',
    'Metodología Integral de Masía y Cantera',
    'Desarrollo Técnico y Visión Espacial',
    'Transición Competitiva a Primera División',
    'Scouting Infantil y Captación Regional',
    'Potenciación de Talento Físico y Mental'
];

export const generateStaffMember = (
    role: StaffRole,
    tier: 'Top' | 'Mid' | 'Lower',
    leagueId?: string
): StaffMember => {
    const isSouthAm = leagueId && [
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA, LeagueId.PRIMERA_DIVISION_CHILE, LeagueId.PRIMERA_B_CHILE,
        LeagueId.PRIMERA_A_COLOMBIA, LeagueId.PRIMERA_B_COLOMBIA,
        'LIGA_ARGENTINA', 'PRIMERA_NACIONAL', 'BRASILEIRAO', 'SERIE_B_BR', 'COPA_DE_PRIMERA', 'PRIMERA_A_COLOMBIA'
    ].includes(leagueId as any);

    const isMex = leagueId && [LeagueId.LIGA_MX, LeagueId.LIGA_EXPANSION_MX, 'LIGA_MX'].includes(leagueId as any);
    const regionScale = isSouthAm ? 0.22 : isMex ? 0.42 : 1.0;

    let minPower = 52;
    let maxPower = 70;
    let baseSalary = 8000;

    if (tier === 'Top') {
        minPower = 82;
        maxPower = 97;
        baseSalary = 45000;
    } else if (tier === 'Mid') {
        minPower = 68;
        maxPower = 85;
        baseSalary = 20000;
    }

    const power = Math.floor(minPower + Math.random() * (maxPower - minPower + 1));
    const salary = Math.floor(baseSalary * (power / 75) * regionScale * (0.85 + Math.random() * 0.3));
    const hiringFee = Math.floor(salary * 5 + (power * (isSouthAm ? 600 : 2500)));

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    let specialty = 'Generalista';
    if (role === 'doctor') specialty = DOCTOR_SPECIALTIES[Math.floor(Math.random() * DOCTOR_SPECIALTIES.length)];
    else if (role === 'fitness_coach') specialty = FITNESS_SPECIALTIES[Math.floor(Math.random() * FITNESS_SPECIALTIES.length)];
    else if (role === 'sporting_director') specialty = SPORTING_DIRECTOR_SPECIALTIES[Math.floor(Math.random() * SPORTING_DIRECTOR_SPECIALTIES.length)];
    else if (role === 'youth_coach') specialty = YOUTH_COACH_SPECIALTIES[Math.floor(Math.random() * YOUTH_COACH_SPECIALTIES.length)];

    return {
        id: `staff_${role}_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
        name: `${firstName} ${lastName}`,
        role,
        power,
        salary,
        hiringFee,
        specialty,
        age: Math.floor(36 + Math.random() * 26),
        nationality: isSouthAm ? (Math.random() > 0.5 ? 'Argentina' : 'Brasil') : (Math.random() > 0.5 ? 'España' : 'Italia')
    };
};

export const generateStaffMarket = (tier: 'Top' | 'Mid' | 'Lower', leagueId?: string): StaffMember[] => {
    const market: StaffMember[] = [];
    const roles: StaffRole[] = ['doctor', 'fitness_coach', 'sporting_director', 'youth_coach'];

    roles.forEach(role => {
        // Generate 3 available candidates per role with varying tiers
        market.push(generateStaffMember(role, tier, leagueId));
        market.push(generateStaffMember(role, tier === 'Top' ? 'Mid' : 'Top', leagueId));
        market.push(generateStaffMember(role, tier === 'Lower' ? 'Mid' : 'Lower', leagueId));
    });

    return market;
};

export const generateInitialClubStaff = (tier: 'Top' | 'Mid' | 'Lower', leagueId?: string): ClubStaff => {
    return {
        doctor: generateStaffMember('doctor', tier, leagueId),
        fitnessCoach: generateStaffMember('fitness_coach', tier, leagueId),
        sportingDirector: generateStaffMember('sporting_director', tier, leagueId),
        youthCoach: generateStaffMember('youth_coach', tier, leagueId)
    };
};

/**
 * Calculador de efectos directos sobre el plantel
 */
export const getDoctorEffect = (doctor?: StaffMember) => {
    const power = doctor?.power ?? 50;
    // Potencia 95 -> reducción del ~45% de lesiones
    // Potencia 56 -> neutral/ligero aumento
    const injuryReductionPct = Math.round(((power - 60) / 100) * 80);
    const recoveryBonusChance = Math.max(0, Math.min(60, Math.round((power - 50) * 1.1)));

    return {
        injuryReductionPct,
        recoveryBonusChance,
        description: power >= 85
            ? 'Cuerpo médico de élite mundial. Reduce drásticamente lesiones musculares y cura bajas hasta dos semanas antes.'
            : power >= 70
            ? 'Servicios médicos competentes con buena capacidad diagnóstica y prevención habitual.'
            : 'Área médica precaria. Frecuencia elevada de lesiones musculares y tiempos de recuperación prolongados.'
    };
};

export const getFitnessEffect = (fitnessCoach?: StaffMember) => {
    const power = fitnessCoach?.power ?? 50;
    const fatigueResistancePct = Math.max(5, Math.min(30, Math.round(((power - 40) / 60) * 28)));
    const weeklyRecoveryBonus = Math.floor(power / 6); // +8 a +16 extra de condición cada semana

    return {
        fatigueResistancePct,
        weeklyRecoveryBonus,
        description: power >= 85
            ? 'Preparación física de primer nivel. El equipo llega entero al minuto 90 y recupera energía a gran velocidad entre partidos.'
            : power >= 70
            ? 'Acondicionamiento físico equilibrado que permite competir dos veces por semana con rotaciones moderadas.'
            : 'Falta de intensidad física. El plantel sufre fatiga extrema y agotamiento en tramos decisivos.'
    };
};

export const getSportingDirectorEffect = (director?: StaffMember) => {
    const power = director?.power ?? 50;
    const transferDiscountPct = Math.max(0, Math.min(15, Math.round((power / 100) * 14)));

    return {
        transferDiscountPct,
        description: power >= 85
            ? 'Director deportivo con peso internacional. Consigue rebajas de hasta un 15% en compras y atrae ofertas superiores por tus descartes.'
            : power >= 70
            ? 'Gestión técnica sólida con buena red de intermediarios en el mercado nacional.'
            : 'Escasa influencia negociadora. Los clubes exigen primas elevadas por sus futbolistas.'
    };
};

export const getYouthCoachEffect = (youthCoach?: StaffMember) => {
    const power = youthCoach?.power ?? 50;
    const academyBonusPoints = Math.max(0, Math.min(12, Math.round(((power - 50) / 50) * 10)));

    return {
        academyBonusPoints,
        description: power >= 85
            ? 'Metodología formativa de clase mundial. Produce periódicamente wonderkids con potencial de estrella internacional.'
            : power >= 70
            ? 'Cantera productiva con canteranos sólidos aptos para debutar en el primer equipo.'
            : 'Fútbol base limitado. Los graduados de la academia rara vez alcanzan nivel para el plantel profesional.'
    };
};

export const getCoachEffect = (coach?: Coach) => {
    const power = coach?.prestige ?? 60;
    const lineRatingBonus = Number((((power - 65) / 100) * 5).toFixed(1));

    return {
        lineRatingBonus,
        description: power >= 85
            ? `DT de élite mundial (${coach?.style}). Otorga un bono táctico de +${lineRatingBonus > 0 ? lineRatingBonus : 0} al poder colectivo del equipo.`
            : power >= 70
            ? `Entrenador respetado (${coach?.style}). Esquema táctico ordenado y buen manejo del vestuario.`
            : `Director técnico de perfil bajo (${coach?.style}). Dificultades tácticas ante rivales de jerarquía.`
    };
};
